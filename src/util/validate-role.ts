import { User } from "@prisma/client";
import { ErrorType } from "constants/errors";

export const validateRole = (user: User, allowedRoles: string[]) => {
  if (!allowedRoles.includes(user.role_id)) {
    throw new Error(ErrorType.FORBIDDEN, {
      cause: "User does not have permission for this action",
    });
  }
};
