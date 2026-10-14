import { object, string, boolean, Schema } from "yup";
import { LoginMfaParams, LoginParams } from "../types/auth";
import { mfaDataSchemaPocketbase } from "backend/provider/auth/pocketbase";
import { EMAIL_REGEX } from "config/config";

const EMAIL_ERROR =
  "Email address is not a valid address. Please check that the email address is entered correctly.";

export const forgotPasswordSchema = object({
  email: string()
    .matches(EMAIL_REGEX, EMAIL_ERROR)
    .required("Email is required"),
});

export const loginSchema: Schema<LoginParams> = object({
  email: string()
    .matches(EMAIL_REGEX, EMAIL_ERROR)
    .required("Email is required"),
  password: string().required(),
});

export const loginMfaSchema: Schema<LoginMfaParams> = object({
  mfaCode: string().required("MFA code is required"),
  mfaData: mfaDataSchemaPocketbase.required("MFA data is required"),
});

export const setFeaturedSchema: Schema<{ featured: boolean }> = object({
  featured: boolean().required(),
});

export const confirmPasswordSchema = object({
  token: string().required("Token is required"),
  password: string().required("Password is required"),
});

export const changePasswordSchema = object({
  oldPassword: string().required("Old password is required"),
  newPassword: string().required("New password is required"),
});

export const mfaEnabledSchema = object({
  enabled: boolean().required(),
});

export const internalMailSchema = object({
  email: string()
    .matches(EMAIL_REGEX, EMAIL_ERROR)
    .required("Email is required"),
  subject: string().required("Subject is required"),
  token: string().optional(),
  otp: string().optional(),
});
