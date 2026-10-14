import { NextApiResponse } from "next";

export const setAuthTokenCookie = (token: string, res: NextApiResponse) => {
  const secureFlag = process.env.STAGE !== "development" ? "Secure; " : "";
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
  res.setHeader(
    "Set-Cookie",
    `auth_token=${token}; HttpOnly; ${secureFlag}Path=/; SameSite=Strict; Expires=${expires}`,
  );
};
