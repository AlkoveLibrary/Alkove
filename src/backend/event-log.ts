import { randomUUID } from "crypto";
import { PrismaConnection } from "./prisma";
import { EventAction } from "@prisma/client";

export const createEventLogRecord = async ({
  event,
  type,
  action,
  ip_address,
  user_agent,
  data,
  user_id,
}: {
  event: string;
  type: string;
  action: EventAction;
  ip_address: string;
  user_agent: string;
  data?: object;
  user_id?: string;
}) => {
  const prisma = PrismaConnection;
  return prisma.eventLog.create({
    data: {
      event_log_id: randomUUID(),
      event,
      type,
      action,
      data,
      ip_address,
      user_agent,
      user_id,
    },
  });
};

export const getEventLogs = async () => {
  const prisma = PrismaConnection;
  return prisma.eventLog.findMany({
    orderBy: { created_at: "desc" },
  });
};

export const getEventLogsBetween = async (from: Date, to: Date) => {
  const prisma = PrismaConnection;
  return prisma.eventLog.findMany({
    where: { created_at: { gte: from, lt: to } },
    orderBy: { created_at: "desc" },
    select: {
      created_at: true,
      event: true,
      ip_address: true,
      user_agent: true,
      user_id: true,
    },
  });
};
