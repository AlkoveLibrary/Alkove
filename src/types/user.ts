export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email?: string;
}

export interface AdminCreateUserRequest {
  first_name: string;
  last_name: string;
  email?: string;
  role_id: string;
}

export type UpdateUserRequest = {
  first_name: string;
  last_name: string;
  email: string | null;
};

export interface CreateUserResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}
import { Role, User } from "@prisma/client";

export type CredentialUser = Omit<User, "auth_id"> & { auth_id: string };

export type UserWithRole = User & { role: Role };

export type BasicUser = Pick<
  User,
  "user_id" | "first_name" | "last_name" | "email"
>;

export type AdminUpdateUserResponse = { message: string };

export type ImportUser = {
  first_name: string;
  last_name: string;
  email?: string;
};

export type BulkResult = {
  index: number;
  created: boolean | null;
  message: string;
};

export interface UserKpiData {
  userCount: number;
  webUserCount: number;
  baseUserCount: number;
  staffUserCount: number;
  adminUserCount: number;
}
