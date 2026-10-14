import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  PrismaConnection: PrismaClient | undefined;
};

const adapter = new PrismaPg(process.env.DATABASE_URL as string);

export const PrismaConnection: PrismaClient =
  globalForPrisma.PrismaConnection ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.PrismaConnection = PrismaConnection;
}
