import { Prisma } from "@prisma/client";
import { ROLES } from "./role";

export const USERS: Prisma.UserCreateManyInput[] = [
  {
    user_id: "53574102-1b14-47c2-9223-f932ca3db09d",
    email: "admin@alkove.ca",
    first_name: "Admin",
    last_name: "User",
    auth_id: "a7622a60-137f-41db-af14-212830d67d44",
    role_id: ROLES[0].role_id,
  },
];
