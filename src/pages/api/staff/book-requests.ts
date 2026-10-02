import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { BookRequestWithUser } from "types/book";
import {
  archiveBookRequest,
  getAllBookRequestsWithUser,
  getBookRequestById,
} from "backend/book-request";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";
import { validateBody } from "util/validate-body";
import { archiveBookRequestSchema } from "schema/book";
import { ErrorType } from "constants/errors";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed book requests",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const book_requests = (await getAllBookRequestsWithUser({
      archived: false,
    })) as BookRequestWithUser[];
    return { message: "Book requests fetched", book_requests };
  },
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { book_request_id } = validateBody(
      req.body,
      archiveBookRequestSchema,
    );

    const bookRequest = await getBookRequestById(book_request_id);
    if (!bookRequest || bookRequest.archived) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Book request not found" });
    }

    const archived = await archiveBookRequest(book_request_id);

    await createEventLog({
      req,
      event: "Book request archived",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        old: bookRequest,
        new: archived,
      },
    });

    return { message: "Book request archived", book_request: archived };
  },
});
