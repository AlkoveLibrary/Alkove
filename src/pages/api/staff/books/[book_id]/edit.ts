import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";

import { ErrorType } from "constants/errors";
import { getBookById, updateBook } from "backend/book";
import { validateBody } from "util/validate-body";
import { editBookSchema } from "schema/book";
import { createEventLog } from "util/create-event-log";
import { sanitizeIsbn } from "util/validate-isbn";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const body = validateBody(req.body, editBookSchema);
    const isbn = sanitizeIsbn(body.isbn);

    const bookId = req.query.book_id;
    if (typeof bookId !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "Invalid book ID" });
    }

    const book = await getBookById(bookId);
    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    const updatedBook = await updateBook(bookId, {
      title: body.title,
      author: body.author,
      // Store a blank ISBN as null so it does not collide on the unique index
      isbn: isbn || null,
      publication_year: body.publication_year,
      format: body.format,
      publisher: body.publisher,
      page_count: body.page_count,
      edition: body.edition,
      dewey_decimal: body.dewey_decimal,
      edition_year: body.edition_year,
      description: body.description,
      genre: body.genre,
    });

    await createEventLog({
      req,
      event: "Book details edited",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { book_id: bookId, old: book, new: updatedBook },
    });

    return book;
  },
});
