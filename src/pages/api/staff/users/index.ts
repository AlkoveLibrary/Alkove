import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getAllUsers, createUser, getUserByEmail } from "backend/user";
import { ErrorType } from "constants/errors";
import { createUserSchema } from "schema/user";
import { validateBody } from "util/validate-body";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed users list",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const users = await getAllUsers();

    const basicUsers = users.map((user) => ({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      auth_id: user.auth_id,
    }));

    return { users: basicUsers };
  },
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const body = validateBody(req.body, createUserSchema);

    const { first_name, last_name, email } = body;

    const lowerCaseEmail = email?.toLowerCase();

    if (lowerCaseEmail) {
      const existingUser = await getUserByEmail(lowerCaseEmail);
      if (existingUser) {
        throw new Error(ErrorType.CONFLICT, {
          cause: "User with this email already exists",
        });
      }
    }

    const newUser = await createUser({
      first_name,
      last_name,
      email: lowerCaseEmail,
    });

    await createEventLog({
      req,
      event: "User created",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { user_id: newUser.user_id },
    });

    return { user: newUser };
  },
});
