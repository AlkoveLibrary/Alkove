import { USERS } from "./data/users";
import { COPIES } from "./data/copies";
import { TRANSACTIONS } from "./data/transactions";

import { PrismaConnection } from "backend/prisma";
import { ROLES } from "./data/role";
import { BOOKS } from "./data/books";
const prisma = PrismaConnection;
async function main(): Promise<void> {
  await prisma.role.createMany({
    data: ROLES,
    skipDuplicates: true,
  });

  await prisma.user.createMany({
    data: USERS,
    skipDuplicates: true,
  });

  await prisma.book.createMany({
    data: BOOKS,
    skipDuplicates: true,
  });

  await prisma.copy.createMany({
    data: COPIES,
    skipDuplicates: true,
  });

  await prisma.transaction.createMany({
    data: TRANSACTIONS,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
