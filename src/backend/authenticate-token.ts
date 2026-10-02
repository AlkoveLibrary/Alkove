import { authenticateTokenPocketbase } from "./provider/auth/pocketbase";

export const authenticateToken = async (token: string) => {
  const auth_id = await authenticateTokenPocketbase(token);
  return auth_id;
};
