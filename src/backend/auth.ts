import { MfaData } from "types/auth";
import {
  changePasswordPocketbase,
  confirmPasswordResetPocketbase,
  createAuthUserPocketbase,
  deleteAuthUserPocketbase,
  getTokenExpiryPocketbase,
  getUserMfaEnabledPocketbase,
  loginWithMfaPocketbase,
  refreshTokenPocketbase,
  requestPasswordResetPocketbase,
  setUserMfaEnabledPocketbase,
  setUserMfaEnabledPocketbaseAdmin,
} from "./provider/auth/pocketbase";

export const changePassword = async (
  auth_id: string,
  email: string,
  token: string,
  oldPassword: string,
  newPassword: string,
  ip: string,
) => {
  return await changePasswordPocketbase(
    auth_id,
    email,
    token,
    oldPassword,
    newPassword,
    ip,
  );
};

export const createAuthUser = async (
  auth_id: string,
  email: string,
  first_name: string,
  last_name: string,
  mfa_enabled: boolean,
) => {
  await createAuthUserPocketbase(
    auth_id,
    email,
    first_name,
    last_name,
    mfa_enabled,
  );
};

export const deleteAuthUser = async (auth_id: string) => {
  await deleteAuthUserPocketbase(auth_id);
};

export const confirmPasswordReset = async (token: string, password: string) => {
  await confirmPasswordResetPocketbase(token, password);
};

export const forgotPassword = async (email: string, ip: string) => {
  await requestPasswordResetPocketbase(email, ip);
};

export const getTokenExpiry = (token: string) => {
  return getTokenExpiryPocketbase(token);
};

export const refreshToken = async (token: string) => {
  return await refreshTokenPocketbase(token);
};

export const loginWithMfa = async (
  mfaCode: string,
  data: MfaData,
  ip: string,
) => {
  return await loginWithMfaPocketbase(mfaCode, data, ip);
};

export const getUserMfaEnabled = async (auth_id: string) => {
  return await getUserMfaEnabledPocketbase(auth_id);
};

export const setUserMfaEnabled = async (
  auth_id: string,
  enabled: boolean,
  token: string,
  ip: string,
) => {
  return await setUserMfaEnabledPocketbase(auth_id, enabled, token, ip);
};

export const setUserMfaEnabledAdmin = async (
  auth_id: string,
  enabled: boolean,
) => {
  return await setUserMfaEnabledPocketbaseAdmin(auth_id, enabled);
};
