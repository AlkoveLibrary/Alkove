import { Schema, ValidationError } from "yup";
import { ErrorType } from "../constants/errors";

export function validateBody<T>(data: unknown, schema: Schema<T>): T {
  try {
    // @ts-expect-error This is valid
    return schema.noUnknown().validateSync(data, {
      abortEarly: false,
      strict: true,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: error.errors.join(", "),
      });
    }

    throw new Error(ErrorType.INTERNAL_SERVER_ERROR, {
      cause: "Validation failed",
    });
  }
}
