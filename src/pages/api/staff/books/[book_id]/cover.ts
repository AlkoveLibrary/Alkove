import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { createUploadedCover } from "backend/cover";
import { parseAndStoreImageUpload } from "util/parse-uploaded-image";
import { ErrorType } from "constants/errors";
import { getBookById, updateBook } from "backend/book";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const bookId = req.query.book_id;
    if (typeof bookId !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "Invalid book ID" });
    }

    const book = await getBookById(bookId);
    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book not found" });
    }

    if (book.cover_id) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Book already has a cover",
      });
    }

    const file = await parseAndStoreImageUpload(req);
    const cover = await createUploadedCover(file);

    await updateBook(bookId, {
      cover: { connect: { cover_id: cover.cover_id } },
    });

    await createEventLog({
      req,
      event: "Book cover uploaded",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { book_id: bookId, cover_id: cover.cover_id },
    });

    return { cover };
  },
});
