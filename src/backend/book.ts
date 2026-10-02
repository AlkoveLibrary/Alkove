import { randomUUID } from "crypto";
import { PrismaConnection } from "./prisma";
import { Prisma } from "@prisma/client";

export const getAllBooks = async (where?: Prisma.BookWhereInput) => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({ where });

  return books;
};

export const getBookCount = async () => {
  const prisma = PrismaConnection;

  const books = await prisma.book.count();

  return books;
};

export const getAllBooksWithTransactionCount = async () => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({
    include: {
      Copy: {
        select: {
          _count: {
            select: {
              Transaction: { where: { checked_out_at: { not: null } } },
            },
          },
        },
      },
    },
  });

  return books.map((book) => ({
    ...book,
    transactionCount: book.Copy.reduce(
      (acc, copy) => acc + copy._count.Transaction,
      0,
    ),
    Copy: undefined,
  }));
};

export const getAllBooksWithCopyCount = async () => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({
    include: {
      _count: { select: { Copy: { where: { archived: false } } } },
      Copy: {
        where: { archived: false },
        select: {
          Transaction: {
            where: {
              OR: [
                { checked_in_at: null, checked_out_at: { not: null } },
                {
                  held_at: { not: null },
                  hold_cancelled_at: null,
                  checked_out_at: null,
                },
              ],
            },
            select: { transaction_id: true, checked_out_at: true },
          },
        },
      },
    },
  });

  return books.map((book) => ({
    ...book,
    availableCount:
      book._count.Copy -
      book.Copy.filter((copy) => copy.Transaction.length > 0).length,
    heldCount: book.Copy.filter(
      (copy) =>
        copy.Transaction.some((transaction) => !transaction.checked_out_at) &&
        !copy.Transaction.some((transaction) => transaction.checked_out_at),
    ).length,
    count: book._count.Copy,
    Copy: undefined,
    _count: undefined,
  }));
};

export const getAllBooksWithCover = async () => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({
    include: {
      cover: true,
    },
  });
  return books;
};

export const getAllBooksWithCopyCountOpac = async () => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({
    select: {
      book_id: true,
      title: true,
      author: true,
      edition_year: true,
      genre: true,
      _count: { select: { Copy: { where: { archived: false } } } },
      Copy: {
        where: { archived: false },
        select: {
          Transaction: {
            where: {
              OR: [
                { checked_in_at: null, checked_out_at: { not: null } },
                {
                  held_at: { not: null },
                  hold_cancelled_at: null,
                  checked_out_at: null,
                },
              ],
            },
            select: { transaction_id: true },
          },
        },
      },
    },
  });

  return books.map((book) => ({
    ...book,
    availableCount:
      book._count.Copy -
      book.Copy.filter((copy) => copy.Transaction.length > 0).length,
    count: book._count.Copy,
    Copy: undefined,
    _count: undefined,
  }));
};

export const createBook = async (
  data: Omit<Prisma.BookCreateInput, "book_id">,
) => {
  const prisma = PrismaConnection;

  const result = await prisma.book.create({
    data: {
      ...data,
      book_id: randomUUID(),
    },
  });

  return result;
};

export const getBookById = async (book_id: string) => {
  const prisma = PrismaConnection;

  const book = await prisma.book.findUnique({
    where: { book_id },
  });

  return book;
};

export const getBookWithActiveTransactions = async (book_id: string) => {
  const prisma = PrismaConnection;

  const book = await prisma.book.findUnique({
    where: { book_id },
    include: {
      Copy: {
        include: {
          Transaction: {
            where: {
              OR: [
                { checked_in_at: null, checked_out_at: { not: null } },
                {
                  held_at: { not: null },
                  hold_cancelled_at: null,
                  checked_out_at: null,
                },
              ],
            },
          },
        },
      },
    },
  });

  return book;
};

export const getBookWithExtras = async (book_id: string) => {
  const prisma = PrismaConnection;

  const book = await prisma.book.findUnique({
    where: { book_id },
    include: {
      Copy: {
        include: {
          Transaction: true,
        },
      },
    },
  });

  return book;
};

export const getBookByISBN = async (isbn: string) => {
  const prisma = PrismaConnection;

  const book = await prisma.book.findFirst({
    where: { isbn },
  });

  return book;
};

export const getBookByCoverId = async (cover_id: string) => {
  const prisma = PrismaConnection;

  const book = await prisma.book.findFirst({
    where: { cover_id },
  });

  return book;
};

export const getBookByCopyId = async (copy_id: string) => {
  const prisma = PrismaConnection;

  const copy = await prisma.copy.findUnique({
    where: { copy_id },
    include: { book: true },
  });

  return copy?.book;
};

export const deleteBook = async (book_id: string) => {
  const prisma = PrismaConnection;

  const deletedBook = await prisma.book.delete({
    where: { book_id },
  });

  return deletedBook;
};

export const updateBook = async (
  book_id: string,
  data: Partial<Omit<Prisma.BookUpdateInput, "book_id">>,
) => {
  const prisma = PrismaConnection;

  const updatedBook = await prisma.book.update({
    where: { book_id },
    data,
  });

  return updatedBook;
};

export const getAllBooksForUser = async (user_id: string) => {
  const prisma = PrismaConnection;

  const books = await prisma.book.findMany({
    where: {
      Copy: {
        some: {
          Transaction: {
            some: {
              user_id,
            },
          },
        },
      },
    },
    include: {
      Copy: {
        where: {
          Transaction: {
            some: {
              user_id,
            },
          },
        },
        include: {
          Transaction: { where: { user_id } },
        },
      },
    },
  });

  return books;
};
