import type { NextApiRequest } from "next";

import { requestHandler } from "backend/request-handler";
import { createBook, getBookByCoverId, getBookByISBN } from "backend/book";
import { createCopies } from "backend/copy";
import { authenticateUser } from "backend/authenticate-user";
import { validateBody } from "util/validate-body";
import { validateRole } from "util/validate-role";
import { createBookSchema } from "schema/book";
import { STAFF } from "constants/roles";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { sanitizeIsbn, toIsbn10, toIsbn13 } from "util/validate-isbn";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req: NextApiRequest) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const body = validateBody(req.body, createBookSchema);
    const isbn = sanitizeIsbn(body.isbn);

    if (isbn) {
      const existingBook = await getBookByISBN(isbn);
      if (existingBook) {
        throw new Error(ErrorType.CONFLICT, {
          cause: "A book with this ISBN already exists",
        });
      }

      if (isbn.length === 13) {
        const isbn10 = toIsbn10(isbn);
        const existingIsbn10Book = isbn10 ? await getBookByISBN(isbn10) : null;
        if (existingIsbn10Book) {
          throw new Error(ErrorType.CONFLICT, {
            cause: `A book with the matching ISBN-10 ${isbn10} already exists`,
          });
        }
      }

      if (isbn.length === 10) {
        const isbn13 = toIsbn13(isbn);
        const existingIsbn13Book = await getBookByISBN(isbn13);
        if (existingIsbn13Book) {
          throw new Error(ErrorType.CONFLICT, {
            cause: `A book with the matching ISBN-13 ${isbn13} already exists`,
          });
        }
      }
    }
    if (body.cover_id) {
      const existingBookWithCover = await getBookByCoverId(body.cover_id);
      if (existingBookWithCover) {
        throw new Error(ErrorType.CONFLICT, {
          cause: "A book with this cover already exists",
        });
      }
    }

    const { copies, ...bookData } = body;
    // Store a blank ISBN as null so it does not collide on the unique index
    const book = await createBook({ ...bookData, isbn: isbn || null });

    await createCopies(book.book_id, copies);

    await createEventLog({
      req,
      event: "Book created",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { book, copies },
    });

    return { message: "Created book and copies", book };
  },
});
