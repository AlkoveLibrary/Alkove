import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ADMINISTRATOR_ONLY, ROLE_IDS } from "constants/roles";
import { getUserByEmail, getUserById, updateUser } from "backend/user";
import { ErrorType } from "constants/errors";
import { createAuthUser, setUserMfaEnabledAdmin } from "backend/auth";
import { randomUUID } from "crypto";
import { MANDATORY_MFA_ROLES } from "config/config";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";
import { adminUpdateUserSchema } from "schema/user";
import { validateBody } from "util/validate-body";

export default requestHandler({
  patch: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "Invalid user ID" });
    }

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Start update user details",
      type: "admin",
      user_id: user.user_id,
      data: {
        user_id,
      },
    });

    const body = validateBody(req.body, adminUpdateUserSchema);

    const lowerCaseEmail = body.email?.toLowerCase();

    const existingUser = await getUserById(user_id);
    if (!existingUser) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }

    // Cannot change email of auth user
    if (existingUser.auth_id) {
      if (lowerCaseEmail !== existingUser.email) {
        throw new Error(ErrorType.BAD_REQUEST, {
          cause: "Cannot change email of a user with web access",
        });
      }
      // Cannot change email to a user with this email address already
    } else {
      if (lowerCaseEmail && lowerCaseEmail !== existingUser.email) {
        const possibleOtherUser = await getUserByEmail(lowerCaseEmail);
        if (possibleOtherUser) {
          throw new Error(ErrorType.CONFLICT, {
            cause: "Email already in use by another user",
          });
        }
      }
    }
    let auth_id = existingUser.auth_id;

    let createdAuthUser = false;

    // If existing local user does not have web access and is being changed to a role that requires web access, create auth user for them
    if (
      !existingUser.auth_id &&
      (body.role_id === ROLE_IDS.STAFF || body.role_id === ROLE_IDS.ADMIN)
    ) {
      auth_id = randomUUID();

      const mfaEnabled = MANDATORY_MFA_ROLES.includes(body.role_id);

      await createAuthUser(
        auth_id,
        lowerCaseEmail,
        body.first_name,
        body.last_name,
        mfaEnabled,
      );
      createdAuthUser = true;
    } else {
      if (existingUser.auth_id && MANDATORY_MFA_ROLES.includes(body.role_id)) {
        await setUserMfaEnabledAdmin(existingUser.auth_id, true);
      }
    }

    await updateUser(user_id, { ...body, email: lowerCaseEmail, auth_id });

    if (createdAuthUser) {
      await createEventLog({
        req,
        action: EventAction.write,
        event: "Upgraded user to have web access",
        type: "admin",
        user_id: user.user_id,
        data: {
          user_id,
        },
      });
      return { message: "User upgraded to have web access" };
    }

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Finished update user details",
      type: "admin",
      user_id: user.user_id,
      data: {
        user_id,
      },
    });

    return { message: "Updated user" };
  },
});
