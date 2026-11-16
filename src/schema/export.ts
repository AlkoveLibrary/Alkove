import { array, object, string } from "yup";
import {
  BOOK_EXPORT_FIELDS,
  SORT_DIRECTIONS,
  SortDirection,
  BookExportFieldKey,
  USER_EXPORT_FIELDS,
  UserExportFieldKey,
} from "constants/export";

export const bookExportSchema = object({
  fields: array()
    .of(
      string<BookExportFieldKey>()
        .oneOf(BOOK_EXPORT_FIELDS.map((field) => field.key))
        .required(),
    )
    .min(1, "At least one field is required")
    .required("Fields are required"),
  sort_by: string<BookExportFieldKey>()
    .oneOf(BOOK_EXPORT_FIELDS.map((field) => field.key))
    .required("Sort field is required"),
  sort_direction: string<SortDirection>()
    .oneOf(SORT_DIRECTIONS)
    .required("Sort direction is required"),
});

export const userExportSchema = object({
  fields: array()
    .of(
      string<UserExportFieldKey>()
        .oneOf(USER_EXPORT_FIELDS.map((field) => field.key))
        .required(),
    )
    .min(1, "At least one field is required")
    .required("Fields are required"),
  sort_by: string<UserExportFieldKey>()
    .oneOf(USER_EXPORT_FIELDS.map((field) => field.key))
    .required("Sort field is required"),
  sort_direction: string<SortDirection>()
    .oneOf(SORT_DIRECTIONS)
    .required("Sort direction is required"),
});
