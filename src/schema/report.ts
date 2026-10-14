import { object, string, mixed } from "yup";

export const reportErrorSchema = object({
  url: string().required("URL is required"),
  error: mixed().required("Error is required"),
});
