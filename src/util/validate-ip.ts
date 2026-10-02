import { ErrorType } from "constants/errors";
import { NextApiRequest } from "next";

export const validateIp = (req: NextApiRequest): string => {
  let ip = req.socket.remoteAddress;

  if (!ip) {
    throw new Error(ErrorType.BAD_REQUEST, {
      cause: "Unable to determine IP address",
    });
  }

  // Normalize IPv4-mapped IPv6 addresses
  ip = ip.startsWith("::ffff:") ? ip.substring(7) : ip;

  // If behind a proxy (e.g, Caddy), use x-forwarded-for if localhost
  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "0.0.0.0" ||
    ip === "::ffff:127.0.0.1"
  ) {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.length > 0) {
      // x-forwarded-for can be a comma-separated list; use the first one
      ip = xff.split(",")[0].trim();
    } else if (Array.isArray(xff) && xff.length > 0) {
      ip = xff[0];
    }
  }

  return ip;
};
