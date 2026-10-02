import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getBookByCoverId, updateBook } from "backend/book";
import { deleteCover } from "backend/cover";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { cover_id } = req.query as { cover_id: string };

    const book = await getBookByCoverId(cover_id);

    if (book) {
      await updateBook(book.book_id, {
        cover: {
          disconnect: true,
        },
      });
    }

    await deleteCover(cover_id);

    await createEventLog({
      req,
      event: "Cover deleted",
      type: "cover",
      action: EventAction.write,
      user_id: user.user_id,
      data: { cover_id, book_id: book?.book_id },
    });

    return { message: "Cover deleted successfully" };
  },
});
