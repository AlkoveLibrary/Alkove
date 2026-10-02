import { getUserByEmail, updateLastLogin } from "backend/user";
import type { NextApiRequest, NextApiResponse } from "next";

import { requestHandler } from "backend/request-handler";
import { ErrorType } from "constants/errors";
import { validateBody } from "util/validate-body";
import { validateIp } from "util/validate-ip";
import { setAuthTokenCookie } from "util/set-token-cookie";
import { logErrorInternal } from "util/log-error-internal";
import { loginWithMfa } from "backend/auth";
import { loginMfaSchema } from "schema/auth";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    const body = validateBody(req.body, loginMfaSchema);

    const ip = validateIp(req);

    let response = null;
    try {
      response = await loginWithMfa(body.mfaCode, body.mfaData, ip);
      setAuthTokenCookie(response.token, res);
    } catch (e) {
      const error = e as unknown as {
        status?: number;
        message?: string;
        response?: { mfaId?: string };
      };

      if (error.status && error.status === 429) {
        throw new Error(ErrorType.TOO_MANY_REQUESTS, {
          cause: "Too many login attempts. Please try again later.",
        });
      }
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause:
          "Incorrect credentials. Please check your username and password and try again.",
      });
    }

    const lowerCaseEmail = response.email.toLowerCase();

    const user = await getUserByEmail(lowerCaseEmail);

    if (!user) {
      await logErrorInternal(
        req,
        new Error("User not found after successful MFA login"),
      );
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause: "User not found. Please contact your administrator.",
      });
    }

    await createEventLog({
      req,
      action: EventAction.read,
      event: "Login with MFA",
      type: "auth",
      user_id: user.user_id,
    });

    await updateLastLogin(user.user_id);

    return { message: "Login successful", user };
  },
});
