import { NextApiRequest } from "next";
import { validateIp } from "../util/validate-ip";
import { errorLogCreate } from "backend/error-log";

export const logErrorInternal = async (
  req: NextApiRequest,
  error: unknown,
  frontend_url?: string,
) => {
  const method = req.method?.toUpperCase() || "UNKNOWN";
  const url = req.url || "UNKNOWN";
  let ip = "UNKNOWN";
  try {
    ip = validateIp(req);
  } catch {}
  const userAgent = req.headers["user-agent"] || "UNKNOWN";

  let errorMessage = "UNKNOWN";
  let errorDump = "";
  if (error instanceof Error) {
    errorMessage = error.message;
    errorDump = JSON.stringify(
      {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      },
      null,
      2,
    );
  } else {
    errorMessage =
      (error as { message?: string })?.message ?? String(error) ?? "UNKNOWN";
    errorDump = JSON.stringify(error, null, 2);
  }

  await errorLogCreate({
    ip_address: ip,
    url: frontend_url || url,
    method: frontend_url ? null : method,
    user_agent: userAgent,
    error: errorMessage,
    error_dump: errorDump,
    type: frontend_url ? "FRONTEND" : "BACKEND",
  });
};
