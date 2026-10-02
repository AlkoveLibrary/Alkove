import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ROLE_IDS, STAFF } from "constants/roles";
import {
  deleteUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from "backend/user";
import { ErrorType } from "constants/errors";
import { updateUserSchema } from "schema/user";
import { validateBody } from "util/validate-body";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "user_id query parameter is required and must be a string",
      });
    }

    const fetchedUser = await getUserById(user_id);

    if (!fetchedUser) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }
    if (fetchedUser.role_id !== ROLE_IDS.USER) {
      throw new Error(ErrorType.FORBIDDEN, {
        cause: "Only users can be deleted.",
      });
    }
    if (fetchedUser.auth_id) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Cannot delete a user with web access. Remove web access first.",
      });
    }

    if (fetchedUser.Transaction.length > 0) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Cannot delete a user with transaction history.",
      });
    }

    await deleteUser(user_id);

    await createEventLog({
      req,
      event: "User deleted",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { deletedUser: fetchedUser },
    });

    return { user: fetchedUser };
  },
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "user_id query parameter is required and must be a string",
      });
    }

    await createEventLog({
      req,
      event: "User details viewed",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: { user_id },
    });

    const fetchedUser = await getUserById(user_id);
    return { user: fetchedUser };
  },
  patch: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const user_id = req.query.user_id;

    if (!user_id || typeof user_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "user_id query parameter is required and must be a string",
      });
    }

    const body = validateBody(req.body, updateUserSchema);

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
    if (existingUser.role_id !== ROLE_IDS.USER) {
      throw new Error(ErrorType.FORBIDDEN, {
        cause: "Only users can be edited.",
      });
    }

    await updateUser(user_id, { ...body, email: lowerCaseEmail });

    await createEventLog({
      req,
      event: "User details edited",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        user_id,
        old: {
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          email: existingUser.email,
        },
        new: { ...body, email: lowerCaseEmail },
      },
    });

    return { message: "Updated user" };
  },
});
