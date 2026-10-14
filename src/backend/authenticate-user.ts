import { NextApiRequest } from "next";

import { ErrorType } from "constants/errors";
import { authenticateToken } from "./authenticate-token";
import { getUserByAuthId } from "./user";
import { CredentialUser } from "types/user";
import { logErrorInternal } from "util/log-error-internal";

export const authenticateUser = async (
  req: NextApiRequest,
): Promise<CredentialUser> => {
  const token = validateToken(req);
  const auth_id = await authenticateToken(token);

  const user = await getUserByAuthId(auth_id);

  try {
    if (!user) {
      await logErrorInternal(
        req,
        new Error("User not found when authenticating token"),
      );
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause: "User not found when authenticating token",
      });
    }
    // @ts-expect-error - We know auth_id is present because we just got the user from the database using the auth_id
    return user;
  } catch {
    throw new Error(ErrorType.UNAUTHORIZED, { cause: "Invalid token" });
  }
};

export const validateToken = (req: NextApiRequest): string => {
  const token = req.cookies.auth_token;
  if (!token) {
    throw new Error(ErrorType.UNAUTHORIZED, { cause: "No token provided" });
  }
  return token;
};
