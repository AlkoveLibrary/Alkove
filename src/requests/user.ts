import {
  AdminCreateUserRequest,
  AdminUpdateUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
} from "types/user";
import { axiosClient } from "util/axios";

export const updateUserProfileRequest = async (data: {
  first_name: string;
  last_name: string;
}) => {
  const response = await axiosClient.patch<{ message: string }>(
    "profile",
    data,
  );
  return response.data;
};

export const upgradeToWebUserRequest = async (user_id: string) => {
  const response = await axiosClient.post<{ message: string }>(
    `staff/users/${user_id}/web-access`,
  );
  return response.data;
};

export const removeFromWebUserRequest = async (user_id: string) => {
  const response = await axiosClient.delete<{ message: string }>(
    `staff/users/${user_id}/web-access`,
  );
  return response.data;
};

export const requestCreateUser = async (
  data: CreateUserRequest,
): Promise<CreateUserResponse> => {
  const res = await axiosClient.post<CreateUserResponse>("staff/users", data);
  return res.data;
};

export const adminCreateUserRequest = async (
  data: AdminCreateUserRequest,
): Promise<CreateUserResponse> => {
  const res = await axiosClient.post<CreateUserResponse>("admin/users", data);
  return res.data;
};

export const requestUpdateUser = async (
  user_id: string,
  data: UpdateUserRequest,
): Promise<CreateUserResponse> => {
  const res = await axiosClient.patch<CreateUserResponse>(
    `staff/users/${user_id}`,
    data,
  );
  return res.data;
};

export const adminUpdateUserRequest = async (
  user_id: string,
  data: UpdateUserRequest & { role_id: string },
) => {
  const res = await axiosClient.patch<AdminUpdateUserResponse>(
    `admin/users/${user_id}`,
    data,
  );
  return res.data;
};

export const requestDeleteUser = async (user_id: string) => {
  const res = await axiosClient.delete<{ message: string }>(
    `staff/users/${user_id}`,
  );
  return res.data;
};
