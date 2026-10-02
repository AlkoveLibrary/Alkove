import type { NextApiRequest, NextApiResponse } from "next";
import { requestHandler } from "backend/request-handler";
import { authenticateUser, validateToken } from "backend/authenticate-user";
import { changePassword } from "backend/auth";
import { setAuthTokenCookie } from "util/set-token-cookie";
import { validateIp } from "util/validate-ip";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";
import { changePasswordSchema } from "schema/auth";
import { validateBody } from "util/validate-body";

export default requestHandler({
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateUser(req);
    const token = validateToken(req);
    const ip = validateIp(req);

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Change password",
      type: "auth",
      user_id: user.user_id,
    });

    const { oldPassword, newPassword } = validateBody(
      req.body,
      changePasswordSchema,
    );

    try {
      const response = await changePassword(
        user.auth_id,
        user.email!,
        token,
        oldPassword,
        newPassword,
        ip,
      );
      if (response.token) {
        setAuthTokenCookie(response.token, res);

        return { message: "Password changed successfully", revalidated: true };
      } else {
        res.setHeader(
          "Set-Cookie",
          "auth_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
        );
        return {
          message: "Password changed successfully. Please log in again.",
          revalidated: false,
        };
      }
    } catch (e) {
      const err = e as {
        status?: number;
        response?: {
          message?: string;
        };
      };
      if (err.status === 429) {
        throw new Error(ErrorType.TOO_MANY_REQUESTS, {
          cause: "Too many password change attempts. Please try again later.",
        });
      }
      throw e;
    }
  },
});
