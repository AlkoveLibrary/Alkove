import { createMailLog } from "backend/mail-log";
import { requestHandler } from "backend/request-handler";
import { getUserByEmail } from "backend/user";
import {
  NEW_ACCOUNT_EMAIL_SUBJECT,
  NEW_ACCOUNT_EMAIL_TEMPLATE,
  OTP_EMAIL_SUBJECT,
  OTP_EMAIL_TEMPLATE,
  PASSWORD_RESET_EMAIL_SUBJECT,
  RESET_PASSWORD_EMAIL_TEMPLATE,
} from "config/config";
import { ErrorType } from "constants/errors";
import { NextApiRequest } from "next";
import { logErrorInternal } from "util/log-error-internal";
import { sendMailWithLog } from "util/mail-with-log";
import { validateLocalRequest } from "util/validate-local";
import { internalMailSchema } from "schema/auth";
import { validateBody } from "util/validate-body";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    // Only allow requests from localhost. This is to communicate with local PocketBase instance only
    validateLocalRequest(req);

    const headers = req.headers as { [key: string]: string };
    const apiKey = headers["x-api-key"];
    const expectedApiKey = process.env.MAIL_SENDER_API_KEY;
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      throw new Error(ErrorType.UNAUTHORIZED, { cause: "Unauthorized" });
    }

    const body = validateBody(req.body, internalMailSchema);

    const lowerCaseEmail = body.email.toLowerCase();

    const user = await getUserByEmail(lowerCaseEmail);
    if (!user) {
      const strippedKey = { ...req };
      delete strippedKey.headers["x-api-key"];
      await logErrorInternal(
        strippedKey as NextApiRequest,
        new Error(
          `Failed to send email: No user found with email: ${lowerCaseEmail}`,
        ),
      );
      await createMailLog(
        lowerCaseEmail,
        body.subject,
        `Failed to send email: No user found with email: ${lowerCaseEmail}`,
        true,
      );
      return {
        success: false,
        message: "No user found with the provided email",
      };
    }

    await createEventLog({
      req,
      event: "Internal mail requested",
      type: "auth",
      action: EventAction.write,
      user_id: user.user_id,
      data: { email: lowerCaseEmail, subject: body.subject },
    });

    const first_name = user.first_name;
    const hasLoggedIn = !!user.last_login;

    if (body.subject === "password_reset") {
      if (!hasLoggedIn) {
        await sendMailWithLog(
          req,
          lowerCaseEmail,
          NEW_ACCOUNT_EMAIL_SUBJECT,
          undefined,
          NEW_ACCOUNT_EMAIL_TEMPLATE(
            `${process.env.NEXT_PUBLIC_WEB_URL}/auth/confirm-password-reset/${body.token}`,
            first_name,
          ),
          body.token ? [body.token] : [],
        );
      } else {
        await sendMailWithLog(
          req,
          lowerCaseEmail,
          PASSWORD_RESET_EMAIL_SUBJECT,
          undefined,
          RESET_PASSWORD_EMAIL_TEMPLATE(
            `${process.env.NEXT_PUBLIC_WEB_URL}/auth/confirm-password-reset/${body.token}`,
            first_name,
          ),
          body.token ? [body.token] : [],
        );
      }
    }
    if (body.subject === "otp") {
      if (!body.otp) {
        throw new Error(ErrorType.BAD_REQUEST, {
          cause: "OTP code is required for otp emails",
        });
      }
      await sendMailWithLog(
        req,
        lowerCaseEmail,
        OTP_EMAIL_SUBJECT,
        undefined,
        OTP_EMAIL_TEMPLATE(body.otp, first_name),
        [body.otp],
      );
    }

    return { success: true, message: "Email sent successfully" };
  },
});
