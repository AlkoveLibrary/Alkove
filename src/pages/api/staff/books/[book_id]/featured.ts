import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";

import { ErrorType } from "constants/errors";
import { getBookById, updateBook } from "backend/book";
import { validateBody } from "util/validate-body";
import { setFeaturedSchema } from "schema/auth";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const body = validateBody(req.body, setFeaturedSchema);

    const bookId = req.query.book_id;
    if (typeof bookId !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "Invalid book ID" });
    }

    const book = await getBookById(bookId);
    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    const updatedBook = await updateBook(bookId, {
      featured: body.featured,
    });

    await createEventLog({
      req,
      event: "Book featured status changed",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        book_id: bookId,
        old: book.featured,
        new: updatedBook.featured,
      },
    });

    return book;
  },
});
