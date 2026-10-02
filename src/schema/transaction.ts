import { object, string } from "yup";

export const createTransactionSchema = object({
  user_id: string().required("User is required"),
  copy_id: string().required("Copy is required"),
});

export const createHoldSchema = object({
  copy_id: string().required("Copy is required"),
});

export const cancelHoldSchema = object({
  transaction_id: string().required("Transaction is required"),
});
