import { getUserByEmail, updateLastLogin } from "backend/user";
import type { NextApiRequest, NextApiResponse } from "next";

import { requestHandler } from "backend/request-handler";
import { ErrorType } from "constants/errors";
import { validateBody } from "util/validate-body";
import { loginSchema } from "schema/auth";
import { authenticateCredentials } from "backend/authenticate-credentials";
import { validateIp } from "util/validate-ip";
import { setAuthTokenCookie } from "util/set-token-cookie";
import { requestOTPPocketbase } from "backend/provider/auth/pocketbase";
import { logErrorInternal } from "util/log-error-internal";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    const body = validateBody(req.body, loginSchema);

    const ip = validateIp(req);

    const lowerCaseEmail = body.email.toLowerCase();

    await createEventLog({
      req,
      event: "Login started",
      action: EventAction.read,
      type: "auth",
      data: { email: lowerCaseEmail },
    });

    try {
      const auth_token = await authenticateCredentials(
        lowerCaseEmail,
        body.password,
        ip,
      );
      setAuthTokenCookie(auth_token, res);
    } catch (e) {
      const error = e as unknown as {
        status?: number;
        message?: string;
        response?: { mfaId?: string };
      };

      if (error.response?.mfaId) {
        await createEventLog({
          req,
          event: "MFA required for login",
          action: EventAction.read,
          type: "auth",
          data: { email: lowerCaseEmail },
        });
        const otpResult = await requestOTPPocketbase(lowerCaseEmail);
        return {
          mfaRequired: true,
          mfaData: { mfaId: error.response.mfaId, otpId: otpResult.otpId },
        };
      }

      if (error.status && error.status === 429) {
        await createEventLog({
          req,
          event: "Error: Too many login attempts",
          type: "auth",
          action: EventAction.read,

          data: { email: lowerCaseEmail },
        });
        throw new Error(ErrorType.TOO_MANY_REQUESTS, {
          cause: "Too many login attempts. Please try again later.",
        });
      }
      await createEventLog({
        req,
        event: "Error: Incorrect credentials",
        type: "auth",
        action: EventAction.read,

        data: { email: lowerCaseEmail },
      });
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause:
          "Incorrect credentials. Please check your username and password and try again.",
      });
    }
    const user = await getUserByEmail(lowerCaseEmail);

    if (!user) {
      await logErrorInternal(
        req,
        new Error("User not found after successful login"),
      );
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause: "User not found. Please contact your administrator.",
      });
    }
    await updateLastLogin(user.user_id);
    await createEventLog({
      req,
      event: "Login successful",
      type: "auth",
      action: EventAction.read,

      data: { email: lowerCaseEmail },
      user_id: user.user_id,
    });

    return { message: "Login successful", user };
  },
});
