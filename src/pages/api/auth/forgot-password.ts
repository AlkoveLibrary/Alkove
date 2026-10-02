import { requestHandler } from "backend/request-handler";
import { forgotPassword } from "backend/auth";
import { validateIp } from "util/validate-ip";
import { validateBody } from "util/validate-body";
import { forgotPasswordSchema } from "schema/auth";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const { email } = validateBody(req.body, forgotPasswordSchema);
    const ip = validateIp(req);
    await createEventLog({
      req,
      action: EventAction.write,
      event: "Password reset requested",
      type: "auth",
      data: { email },
    });

    try {
      await forgotPassword(email, ip);

      await createEventLog({
        req,
        action: EventAction.write,
        event: "Password reset requested",
        type: "auth",
        data: { email },
      });
    } catch (e) {
      await createEventLog({
        req,
        action: EventAction.write,
        event: "Password reset processed - error",
        type: "auth",
        data: {
          email,
          error:
            e instanceof Error ? { message: e.message, stack: e.stack } : e,
        },
      });
      throw e;
    }

    return { message: "Password reset successfully" };
  },
});
