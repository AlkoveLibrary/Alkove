import {
  CreateBookParams,
  CreateBookRequestParams,
  EditBookParams,
} from "types/book";
import { array, number, object, Schema, string } from "yup";
import { validateIsbn } from "util/validate-isbn";

export const createBookRequestSchema: Schema<CreateBookRequestParams> = object({
  title: string().required("Title is required"),
  author: string().required("Author is required"),
  notes: string().optional(),
});

export const archiveBookRequestSchema = object({
  book_request_id: string().required("Book request is required"),
});

export const searchOpenLibrarySchema = object({
  isbn: string().required("ISBN is required"),
});

export const validateBookForm = (values: {
  isbn?: string | null;
  no_isbn?: boolean;
}) => {
  const errors: { isbn?: string } = {};
  if (!values.no_isbn && !values.isbn?.trim()) {
    errors.isbn = "ISBN is required";
  }
  return errors;
};

export const createBookSchema: Schema<CreateBookParams> = object({
  title: string().required("Title is required"),
  author: string().optional(),
  isbn: string()
    .optional()
    .nullable()
    .test(
      "is-valid-isbn",
      "ISBN must be a valid ISBN-10 or ISBN-13",
      (value, ctx) => {
        if (!value) {
          return true;
        }
        const { valid, error } = validateIsbn(value, false);
        if (!valid) {
          return ctx.createError({ message: error });
        }
        return valid;
      },
    ),
  cover_id: string().optional(),
  publication_year: number()
    .integer()
    .optional()
    .nullable()
    .min(1800, "Edition year must be 1800 or later")
    .max(new Date().getFullYear() + 1, `Edition year cannot be in the future`),
  format: string().optional(),
  publisher: string().optional(),
  page_count: number()
    .integer()
    .optional()
    .nullable()
    .min(1, "Page count must be at least 1"),
  edition: string().optional(),
  dewey_decimal: string().optional(),
  edition_year: number()
    .integer()
    .optional()
    .nullable()
    .min(1800, "Edition year must be 1800 or later")
    .max(new Date().getFullYear() + 1, `Edition year cannot be in the future`),
  description: string().optional(),
  genre: string().optional(),
  copies: array()
    .of(
      object({
        location: string().optional(),
        condition: string().optional(),
        notes: string().optional(),
      }).required(),
    )
    .required(),
});

export const editBookSchema: Schema<EditBookParams> = object({
  title: string().required("Title is required"),
  author: string().optional(),
  isbn: string()
    .optional()
    .nullable()
    .test(
      "is-valid-isbn",
      "ISBN must be a valid ISBN-10 or ISBN-13",
      (value, ctx) => {
        if (!value) {
          return true;
        }
        const { valid, error } = validateIsbn(value, false);
        if (!valid) {
          return ctx.createError({ message: error });
        }
        return valid;
      },
    ),
  cover_id: string().optional(),
  publication_year: number()
    .integer()
    .optional()
    .nullable()
    .min(1800, "Edition year must be 1800 or later")
    .max(new Date().getFullYear() + 1, `Edition year cannot be in the future`),
  format: string().optional(),
  publisher: string().optional(),
  page_count: number()
    .integer()
    .optional()
    .nullable()
    .min(1, "Page count must be at least 1"),
  edition: string().optional(),
  dewey_decimal: string().optional(),
  edition_year: number()
    .integer()
    .optional()
    .nullable()
    .min(1800, "Edition year must be 1800 or later")
    .max(new Date().getFullYear() + 1, `Edition year cannot be in the future`),
  description: string().optional(),
  genre: string().optional(),
});
