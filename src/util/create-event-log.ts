import { NextApiRequest } from "next";
import { logErrorInternal } from "./log-error-internal";
import { validateIp } from "./validate-ip";
import { createEventLogRecord } from "backend/event-log";
import { EventAction } from "@prisma/client";

export const createEventLog = async ({
  req,
  event,
  type,
  action,
  data,
  user_id,
}: {
  req: NextApiRequest;
  event: string;
  type: string;
  action: EventAction;
  data?: object;
  user_id?: string;
}): Promise<void> => {
  const ip_address = validateIp(req);
  const user_agent = req.headers["user-agent"] || "UNKNOWN";
  try {
    await createEventLogRecord({
      event,
      type,
      action,
      ip_address,
      user_agent,
      data,
      user_id,
    });
  } catch (error) {
    await logErrorInternal(req, error);
  }
};
