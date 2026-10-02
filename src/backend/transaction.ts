import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { PrismaConnection } from "./prisma";

export const getAllTransactions = async (
  where?: Prisma.TransactionWhereInput,
) => {
  const prisma = PrismaConnection;
  return prisma.transaction.findMany({
    where,
    include: {
      user: true,
      copy: { include: { book: true } },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getTransactionById = async (transaction_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.findUnique({
    where: { transaction_id },
    include: {
      user: true,
      copy: { include: { book: true } },
    },
  });
};

export const getOpenTransactionByCopyId = async (copy_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.findFirst({
    where: {
      copy_id,
      checked_out_at: { not: null },
      checked_in_at: null,
    },
  });
};

export const checkInTransaction = async (transaction_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.update({
    where: { transaction_id },
    data: { checked_in_at: new Date() },
    include: {
      user: true,
      copy: { include: { book: true } },
    },
  });
};

export const createTransaction = async (user_id: string, copy_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.create({
    data: {
      transaction_id: randomUUID(),
      user_id,
      copy_id,
      checked_out_at: new Date(),
    },
  });
};

export const checkoutHold = async (transaction_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.update({
    where: { transaction_id },
    data: { checked_out_at: new Date() },
  });
};

export const getActiveHoldByCopyId = async (copy_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.findFirst({
    where: {
      copy_id,
      held_at: { not: null },
      hold_cancelled_at: null,
      checked_out_at: null,
    },
  });
};

export const createHold = async (user_id: string, copy_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.create({
    data: {
      transaction_id: randomUUID(),
      user_id,
      copy_id,
      held_at: new Date(),
    },
  });
};

export const cancelHold = async (transaction_id: string) => {
  const prisma = PrismaConnection;
  return prisma.transaction.update({
    where: { transaction_id },
    data: { hold_cancelled_at: new Date() },
  });
};
