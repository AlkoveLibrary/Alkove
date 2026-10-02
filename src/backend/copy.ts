import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { PrismaConnection } from "./prisma";

export const createCopies = async (
  book_id: string,
  copies: Array<{ location?: string; condition?: string; notes?: string }>,
) => {
  const prisma = PrismaConnection;

  const data = copies.map((copy) => ({
    ...copy,
    book_id,
    copy_id: randomUUID(),
  }));
  return prisma.copy.createMany({ data });
};

export const getCopiesByBookId = async (
  book_id: string,
  where?: Prisma.CopyWhereInput,
) => {
  const prisma = PrismaConnection;
  return prisma.copy.findMany({
    where: { book_id, ...where },
    include: {
      Transaction: {
        where: {
          OR: [
            { checked_out_at: { not: null }, checked_in_at: null },
            {
              held_at: { not: null },
              hold_cancelled_at: null,
              checked_out_at: null,
            },
          ],
        },
        include: { user: true },
      },
    },
    orderBy: { created_at: "asc" },
  });
};

export const createCopy = async (data: {
  book_id: string;
  location: string | null;
  condition: string | null;
  notes: string | null;
}) => {
  const prisma = PrismaConnection;
  return prisma.copy.create({
    data: {
      ...data,
      copy_id: randomUUID(),
    },
  });
};

export const editCopy = async (data: {
  copy_id: string;
  location: string | null;
  condition: string | null;
  notes: string | null;
}) => {
  const prisma = PrismaConnection;

  return prisma.copy.update({
    where: { copy_id: data.copy_id },
    data: {
      location: data.location,
      condition: data.condition,
      notes: data.notes,
    },
  });
};

export const archiveCopy = async (data: {
  copy_id: string;
  archived: boolean;
}) => {
  const prisma = PrismaConnection;

  return prisma.copy.update({
    where: { copy_id: data.copy_id },
    data: {
      archived: data.archived,
    },
  });
};

export const getCopyById = async (copy_id: string) => {
  const prisma = PrismaConnection;
  return prisma.copy.findUnique({
    where: { copy_id },
    include: {
      book: true,
      Transaction: {
        include: { user: true },
        orderBy: { created_at: "desc" },
      },
    },
  });
};

export const getCopyCount = async (where?: Prisma.CopyWhereInput) => {
  const prisma = PrismaConnection;

  const copies = await prisma.copy.count({ where });

  return copies;
};

export const deleteCopy = async (copy_id: string) => {
  const prisma = PrismaConnection;

  const copies = await prisma.copy.delete({ where: { copy_id } });

  return copies;
};
