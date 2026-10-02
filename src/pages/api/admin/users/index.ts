import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { getAllUsers, createUser, getUserByEmail } from "backend/user";
import { ADMINISTRATOR_ONLY, ROLE_IDS } from "constants/roles";
import { validateRole } from "util/validate-role";
import { validateBody } from "util/validate-body";
import { adminCreateUserSchema } from "schema/user";
import { ErrorType } from "constants/errors";
import { createAuthUser } from "backend/auth";
import { randomUUID } from "crypto";
import { MANDATORY_MFA_ROLES } from "config/config";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      action: EventAction.read,
      event: "Get all users",
      type: "admin",
      user_id: user.user_id,
    });

    const users = await getAllUsers();

    return { users };
  },
  post: async (req) => {
    const requestingUser = await authenticateUser(req);

    validateRole(requestingUser, ADMINISTRATOR_ONLY);

    const { first_name, last_name, email, role_id } = validateBody(
      req.body,
      adminCreateUserSchema,
    );

    const lowerCaseEmail = email.toLowerCase();

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Create user",
      type: "admin",
      user_id: requestingUser.user_id,
    });

    const auth_id = randomUUID();

    const existingUser = await getUserByEmail(lowerCaseEmail);

    if (existingUser) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "Email already in use by another user",
      });
    }

    if (role_id !== ROLE_IDS.USER) {
      const enableMfa = MANDATORY_MFA_ROLES.includes(role_id);
      await createAuthUser(
        auth_id,
        lowerCaseEmail,
        first_name,
        last_name,
        enableMfa,
      );
    }
    const user = await createUser({
      first_name,
      last_name,
      email: lowerCaseEmail,
      role_id,
      auth_id,
    });

    await createEventLog({
      req,
      action: EventAction.write,
      event: "User created",
      type: "admin",
      user_id: user.user_id,
      data: {
        user_id: user.user_id,
      },
    });

    return { user };
  },
});
