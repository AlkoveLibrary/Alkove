import { randomUUID } from "crypto";
import { PrismaConnection } from "./prisma";

export const createUploadedCover = async (file_path: string) => {
  const prisma = PrismaConnection;
  return prisma.cover.create({
    data: {
      cover_id: randomUUID(),
      file_path,
    },
  });
};

export const getCoverById = async (cover_id: string) => {
  const prisma = PrismaConnection;
  return prisma.cover.findFirst({
    where: { cover_id },
  });
};

export const getCoverByOpenlibraryCoverId = async (
  openlibrary_cover_id: number,
) => {
  const prisma = PrismaConnection;
  return prisma.cover.findFirst({
    where: { openlibrary_cover_id },
  });
};

export const createCover = async (
  openlibrary_cover_id: number,
  file_path: string,
) => {
  const prisma = PrismaConnection;
  return prisma.cover.create({
    data: {
      cover_id: randomUUID(),
      openlibrary_cover_id,
      file_path,
    },
  });
};

export const deleteCover = async (cover_id: string) => {
  const prisma = PrismaConnection;
  await prisma.cover.delete({
    where: { cover_id },
  });
};
