import { EMAIL_REGEX } from "config/config";
import { object, string, array } from "yup";

export const createUserSchema = object({
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  email: string()
    .email("Email must be a valid email address")
    .matches(EMAIL_REGEX, "Email must be a valid email address")
    .optional(),
});

export const updateUserSchema = createUserSchema;

export const adminCreateUserSchema = object({
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  email: string()
    .email("Email must be a valid email address")
    .matches(EMAIL_REGEX, "Email must be a valid email address")
    .required("Email is required for non-user roles"),
  role_id: string().required("Role is required"),
});

export const adminUpdateUserSchema = adminCreateUserSchema;

export const bulkCreateUserSchema = object({
  users: array()
    .of(
      object({
        first_name: string().required("First name is required"),
        last_name: string().required("Last name is required"),
        email: string()
          .email("Email must be a valid email address")
          .matches(EMAIL_REGEX, "Email must be a valid email address")
          .optional(),
      }).required(),
    )
    .required("Users array is required"),
});

export const updateProfileSchema = object({
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
});
