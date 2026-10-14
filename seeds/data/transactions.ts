import { Prisma } from "@prisma/client";
import { COPIES } from "./copies";
import { USERS } from "./users";

const userId = USERS[0].user_id;
const copy1 = COPIES[0].copy_id;
const copy2 = COPIES[1].copy_id;

export const TRANSACTIONS: Prisma.TransactionCreateManyInput[] = [
  {
    transaction_id: "C2000000-0000-0000-0000-000000000001",
    user_id: userId,
    copy_id: copy1,
    checked_out_at: new Date("2026-03-20T10:00:00Z"),
    checked_in_at: null,
  },
  {
    transaction_id: "C2000000-0000-0000-0000-000000000002",
    user_id: userId,
    copy_id: copy2,
    checked_out_at: new Date("2026-02-01T09:00:00Z"),
    checked_in_at: new Date("2026-02-15T14:30:00Z"),
  },
];
