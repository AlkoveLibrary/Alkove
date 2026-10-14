import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ROLE_IDS, STAFF } from "constants/roles";
import { ErrorType } from "constants/errors";
import { getUserById, setUserAuthId } from "backend/user";
import { randomUUID } from "crypto";
import { createAuthUser, deleteAuthUser } from "backend/auth";
import { MANDATORY_MFA_ROLES } from "config/config";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const requestingUser = await authenticateUser(req);
    validateRole(requestingUser, STAFF);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "user_id query parameter is required and must be a string",
      });
    }

    const user = await getUserById(user_id);

    if (!user) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }

    if (user.auth_id) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "User already has web access",
      });
    }

    if (!user.email) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "User has no email address",
      });
    }

    const auth_id = randomUUID();

    const mfaEnabled = MANDATORY_MFA_ROLES.includes(user.role_id);

    await createAuthUser(
      auth_id,
      user.email,
      user.first_name,
      user.last_name,
      mfaEnabled,
    );

    await setUserAuthId(user_id, auth_id);

    await createEventLog({
      req,
      event: "Upgraded user to have web access",
      type: "staff",
      action: EventAction.write,
      user_id: requestingUser.user_id,
      data: { user_id, auth_id },
    });

    return { message: "User upgraded to web access" };
  },
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "user_id query parameter is required and must be a string",
      });
    }

    const existingUser = await getUserById(user_id);

    if (!existingUser) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }

    if (!existingUser.auth_id) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "User does not have web access",
      });
    }
    if (existingUser.role_id !== ROLE_IDS.USER) {
      throw new Error(ErrorType.FORBIDDEN, {
        cause: "Only users can be edited.",
      });
    }

    await deleteAuthUser(existingUser.auth_id);

    await setUserAuthId(user_id, null);

    await createEventLog({
      req,
      event: "Revoked user web access",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { user_id, auth_id: existingUser.auth_id },
    });

    return { message: "User web access revoked" };
  },
});
