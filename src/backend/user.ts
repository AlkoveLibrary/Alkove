import { Prisma } from "@prisma/client";
import { PrismaConnection } from "./prisma";
import { randomUUID } from "crypto";
import { ROLE_IDS } from "constants/roles";

export const getUserByEmail = async (email: string) => {
  const prisma = PrismaConnection;
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  return user;
};

export const getUserById = async (user_id: string) => {
  const prisma = PrismaConnection;

  const user = await prisma.user.findUnique({
    where: { user_id },
    include: {
      role: true,
      Transaction: {
        include: { copy: { include: { book: true } } },
        orderBy: { created_at: "desc" },
      },
    },
  });

  return user;
};

export const getUserByAuthId = async (auth_id: string) => {
  const prisma = PrismaConnection;

  const user = await prisma.user.findUnique({
    where: { auth_id },
    include: {
      role: true,
    },
  });

  return user;
};

export const getAllUsers = async () => {
  const prisma = PrismaConnection;

  const users = await prisma.user.findMany({
    include: {
      role: true,
    },
  });

  return users;
};

export const searchUsers = async (query: string) => {
  const prisma = PrismaConnection;
  return prisma.user.findMany({
    where: {
      OR: [
        { first_name: { contains: query, mode: "insensitive" } },
        { last_name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
};

export const createUser = async (data: {
  first_name: string;
  last_name: string;
  email?: string;
  role_id?: string;
  auth_id?: string;
}) => {
  const prisma = PrismaConnection;
  return prisma.user.create({
    data: {
      user_id: randomUUID(),
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      role_id: data.role_id ?? ROLE_IDS.USER,
      auth_id: data.auth_id || null,
    },
    include: { role: true },
  });
};

export const setUserAuthId = async (
  user_id: string,
  auth_id: string | null,
) => {
  const prisma = PrismaConnection;
  return prisma.user.update({
    where: { user_id },
    data: { auth_id },
  });
};

export const updateUser = async (
  user_id: string,
  data: Omit<Prisma.UserUpdateInput, "user_id">,
) => {
  const prisma = PrismaConnection;
  return prisma.user.update({
    where: { user_id },
    data,
  });
};

export const updateLastLogin = async (user_id: string) => {
  const prisma = PrismaConnection;
  return prisma.user.update({
    where: { user_id },
    data: { last_login: new Date(), last_activity: new Date() },
  });
};

export const updateLastActivity = async (user_id: string) => {
  const prisma = PrismaConnection;
  return prisma.user.update({
    where: { user_id },
    data: { last_activity: new Date() },
  });
};

export const deleteUser = async (user_id: string) => {
  const prisma = PrismaConnection;
  return prisma.user.delete({
    where: { user_id },
  });
};
