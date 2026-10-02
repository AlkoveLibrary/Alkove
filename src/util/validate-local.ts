import { ErrorType } from "constants/errors";
import { NextApiRequest } from "next";

export const validateLocalRequest = (req: NextApiRequest) => {
  const remoteAddress =
    req.socket?.remoteAddress || req.connection?.remoteAddress;
  const allowedAddresses = [
    "::1", // IPv6 localhost
    "127.0.0.1", // IPv4 localhost
    "::ffff:127.0.0.1", // IPv4-mapped IPv6 localhost
  ];
  if (!remoteAddress || !allowedAddresses.includes(remoteAddress)) {
    throw new Error(ErrorType.UNAUTHORIZED, { cause: "Unauthorized" });
  }
};
