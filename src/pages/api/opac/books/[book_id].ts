import { requestHandler } from "backend/request-handler";
import { getBookWithActiveTransactions } from "backend/book";
import { authenticateUser } from "backend/authenticate-user";
import { ErrorType } from "constants/errors";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  get: async (req) => {
    const book_id = req.query.book_id;
    if (!book_id || typeof book_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "No book_id provided" });
    }

    const book = await getBookWithActiveTransactions(book_id);

    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    await createEventLog({
      req,
      event: "Book details viewed",
      type: "opac",
      action: EventAction.read,
      data: { book_id },
    });

    const user = req.cookies.auth_token
      ? await authenticateUser(req).catch(() => null)
      : null;

    const nonArchivedCopies = book.Copy.filter((copy) => !copy.archived);

    const publicBook = {
      ...book,
      Copy: nonArchivedCopies.map((copy) => ({
        copy_id: copy.copy_id,
        location: copy.location,
        condition: copy.condition,
        notes: copy.notes,
        updated_at: copy.updated_at,
        created_at: copy.created_at,
        available: copy.Transaction.length === 0,
        held: copy.Transaction.some(
          (transaction) => transaction.held_at && !transaction.checked_out_at,
        ),
        held_by_self: copy.Transaction.some(
          (transaction) =>
            transaction.held_at &&
            !transaction.checked_out_at &&
            transaction.user_id === user?.user_id,
        ),
      })),
    };

    return { book: publicBook };
  },
});
