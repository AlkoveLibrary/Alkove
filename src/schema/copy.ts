import { object, string } from "yup";

export const createCopySchema = object({
  book_id: string().required(),
  location: string().nullable().defined(),
  condition: string().nullable().defined(),
  notes: string().nullable().defined(),
});

export const editCopySchema = object({
  location: string().nullable().defined(),
  condition: string().nullable().defined(),
  notes: string().nullable().defined(),
});
