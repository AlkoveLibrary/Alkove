import { requestHandler } from "backend/request-handler";
import { deleteBook, getBookWithExtras } from "backend/book";
import { ErrorType } from "constants/errors";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";

export default requestHandler({
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const book_id = req.query.book_id;
    if (!book_id || typeof book_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "No book_id provided" });
    }

    const book = await getBookWithExtras(book_id);

    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    if (book.Copy.length > 0) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "Can't delete a book with copies",
      });
    }

    await deleteBook(book_id);

    await createEventLog({
      req,
      event: "Book deleted",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { deletedBook: book },
    });

    return { message: "Deleted book" };
  },
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const book_id = req.query.book_id;
    if (!book_id || typeof book_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "No book_id provided" });
    }

    const book = await getBookWithExtras(book_id);

    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    await createEventLog({
      req,
      event: "Book details viewed",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: { book_id },
    });

    const publicBook = {
      ...book,
      Copy: book.Copy.map((copy) => ({
        copy_id: copy.copy_id,
        location: copy.location,
        condition: copy.condition,
        notes: copy.notes,
        updated_at: copy.updated_at,
        created_at: copy.created_at,
        archived: copy.archived,
        available:
          copy.Transaction.filter(
            (transaction) =>
              transaction.checked_out_at !== null &&
              transaction.checked_in_at === null,
          ).length === 0,
        held: copy.Transaction.some(
          (transaction) =>
            transaction.held_at !== null &&
            transaction.hold_cancelled_at === null &&
            transaction.checked_out_at === null,
        ),
        has_transactions: copy.Transaction.length > 0,
      })),
    };

    return { book: publicBook };
  },
});
