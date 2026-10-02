import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { PrismaConnection } from "./prisma";

export const sendBookRequest = async ({
  title,
  author,
  notes,
  user_id,
}: {
  title: string;
  author: string;
  notes?: string;
  user_id: string;
}) => {
  const prisma = PrismaConnection;

  await prisma.bookRequest.create({
    data: {
      book_request_id: randomUUID(),
      title,
      author,
      notes,
      user_id,
    },
  });
};

export const getAllBookRequestsWithUser = async (
  where?: Prisma.BookRequestWhereInput,
) => {
  const prisma = PrismaConnection;

  return await prisma.bookRequest.findMany({
    where,
    orderBy: {
      created_at: "desc",
    },
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

export const getBookRequestById = async (book_request_id: string) => {
  const prisma = PrismaConnection;

  return await prisma.bookRequest.findUnique({
    where: { book_request_id },
  });
};

export const archiveBookRequest = async (book_request_id: string) => {
  const prisma = PrismaConnection;

  return await prisma.bookRequest.update({
    where: { book_request_id },
    data: { archived: true },
  });
};
