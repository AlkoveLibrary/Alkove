import { EventAction } from "@prisma/client";
import { confirmPasswordReset } from "backend/auth";
import { requestHandler } from "backend/request-handler";
import { createEventLog } from "util/create-event-log";
import { getEmailFromToken } from "util/email-from-token";
import { confirmPasswordSchema } from "schema/auth";
import { validateBody } from "util/validate-body";

export default requestHandler({
  post: async (req) => {
    const { token, password } = validateBody(req.body, confirmPasswordSchema);
    const email = getEmailFromToken(token);

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Start confirm password reset",
      type: "auth",
      data: { email },
    });

    await confirmPasswordReset(token, password);

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Finish confirm password reset",
      type: "auth",
      data: { email },
    });

    return { message: "Password set successfully" };
  },
});
