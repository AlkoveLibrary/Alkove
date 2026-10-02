import { LoginMfaParams, MFARequiredResponse } from "types/auth";
import { UserWithRole } from "types/user";
import { axiosClient, fetcher } from "util/axios";

export const loginRequest = async (body: {
  email: string;
  password: string;
}) => {
  const response = await axiosClient.post<
    MFARequiredResponse | { message: string; user: UserWithRole }
  >("auth/login", body);
  return response.data;
};

export const loginWithMfaRequest = async (body: LoginMfaParams) => {
  const response = await axiosClient.post<{
    message: string;
    user: UserWithRole;
  }>("auth/login-mfa", body);
  return response.data;
};

export const logoutRequest = async () => {
  const response = await axiosClient.post("auth/logout");
  return response.data;
};

export const getSelfRequest = () =>
  fetcher<{
    user: UserWithRole;
  }>("auth/self");

export const changePasswordRequest = async (body: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await axiosClient.post<{
    message: string;
    revalidated: boolean;
  }>("auth/change-password", body);
  return response.data;
};

export const setMfaEnabledRequest = async (enabled: boolean) => {
  const response = await axiosClient.post<{ success: boolean }>("auth/mfa", {
    enabled,
  });
  return response.data;
};

export const getMfaEnabledAdminRequest = async (user_id: string) => {
  const response = await axiosClient.get<{ mfaEnabled: boolean }>(
    `admin/users/${user_id}/mfa`,
  );
  return response.data;
};
