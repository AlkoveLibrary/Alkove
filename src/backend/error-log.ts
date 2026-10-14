import { PrismaConnection } from "./prisma";
import { randomUUID } from "crypto";

export const errorLogCreate = async (inputData: {
  ip_address: string;
  url: string;
  method: string | null;
  user_agent: string;
  error: string;
  error_dump: string;
  type: string;
}) => {
  await PrismaConnection.errorLog.create({
    data: {
      error_log_id: randomUUID(),
      ...inputData,
    },
  });
};

export const errorLogGetAll = async () => {
  return PrismaConnection.errorLog.findMany({
    orderBy: { created_at: "desc" },
  });
};
