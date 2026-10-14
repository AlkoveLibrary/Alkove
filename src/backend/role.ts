import { PrismaConnection } from "./prisma";

export const getRoles = async () => {
  const prisma = PrismaConnection;

  const roles = await prisma.role.findMany();

  return roles;
};
