import { EventAction } from "@prisma/client";
import { getUserMfaEnabled } from "backend/auth";
import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { getUserById } from "backend/user";
import { ErrorType } from "constants/errors";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { createEventLog } from "util/create-event-log";
import { validateRole } from "util/validate-role";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    const user_id = req.query.user_id as string;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Invalid user ID",
      });
    }

    await createEventLog({
      req,
      action: EventAction.read,
      event: "Viewed user MFA status",
      type: "admin",
      user_id: user.user_id,
      data: {
        user_id,
      },
    });

    const requestingUser = await getUserById(user_id);

    if (!requestingUser) {
      throw new Error(ErrorType.NOT_FOUND, {
        cause: "User not found",
      });
    }
    if (!requestingUser.auth_id) {
      return { mfaEnabled: false };
    }

    const mfaEnabled = await getUserMfaEnabled(requestingUser.auth_id);

    return { mfaEnabled };
  },
});
