import { authenticateCredentialsPocketbase } from "./provider/auth/pocketbase";

export const authenticateCredentials = async (
  email: string,
  password: string,
  ip: string,
) => {
  return authenticateCredentialsPocketbase(email, password, ip);
};
