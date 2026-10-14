import { randomUUID } from "crypto";
import { PrismaConnection } from "./prisma";

export const createMailLog = async (
  to: string,
  subject: string,
  body: string,
  error: boolean = false,
) => {
  const prisma = PrismaConnection;
  return prisma.mailLog.create({
    data: {
      mail_log_id: randomUUID(),
      to,
      subject,
      body,
      error_at: error ? new Date() : undefined,
    },
  });
};

export const updateMailLog = async (
  mail_log_id: string,
  error?: string,
  sent?: boolean,
) => {
  const prisma = PrismaConnection;
  return prisma.mailLog.update({
    where: { mail_log_id },
    data: {
      error,
      sent_at: sent ? new Date() : undefined,
      error_at: error ? new Date() : undefined,
    },
  });
};

export const getMailLogs = async () => {
  const prisma = PrismaConnection;
  return prisma.mailLog.findMany({
    orderBy: { created_at: "desc" },
  });
};
