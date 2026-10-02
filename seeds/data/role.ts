import { Prisma } from "@prisma/client";

export const ROLES: Prisma.RoleCreateManyInput[] = [
  {
    role_id: "6def72d6-da44-4243-9b47-ecc6d921d191",
    name: "Administrator",
  },
  {
    role_id: "abe6e8d0-29e2-4db7-9bf3-5a0cf50f1815",
    name: "Staff",
  },
  {
    role_id: "3c8c485f-fd70-4373-9e89-de9ecdf76285",
    name: "User",
  },
];
