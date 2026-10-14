import { NextApiRequest } from "next";
import { validateIp } from "util/validate-ip";

export const logErrorConsole = (req: NextApiRequest, error: unknown) => {
  const timestamp = new Date().toISOString();
  const method = req.method?.toUpperCase() || "UNKNOWN";
  const url = req.url || "UNKNOWN";
  let ip = "UNKNOWN";
  try {
    ip = validateIp(req);
  } catch {}
  const userAgent = req.headers["user-agent"] || "UNKNOWN";

  console.error(`\n${"=".repeat(60)}`);
  console.error(`[ERROR] [${timestamp}]`);
  console.error(`${"=".repeat(60)}`);
  console.error(`[REQUEST] ${method} ${url}`);
  console.error(`[IP] ${ip}`);
  console.error(`[USER-AGENT] ${userAgent}`);

  if (error instanceof Error) {
    console.error(`\n[MESSAGE] ${error.message}`);
    if (error.cause) {
      console.error(`[CAUSE] ${JSON.stringify(error.cause, null, 2)}`);
    }
    if (error.stack) {
      console.error(`\n[STACK TRACE]\n${error.stack}`);
    }
  } else {
    console.error(`\n[MESSAGE] ${JSON.stringify(error, null, 2)}`);
  }

  console.error(`${"=".repeat(60)}\n`);
};
