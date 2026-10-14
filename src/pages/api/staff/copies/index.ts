import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getCopiesByBookId, createCopy } from "backend/copy";
import { validateBody } from "util/validate-body";
import { createCopySchema } from "schema/copy";
import { ErrorType } from "constants/errors";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const book_id = req.query.book_id;

    if (!book_id || typeof book_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "book_id is required and must be a string",
      });
    }

    await createEventLog({
      req,
      event: "Copies for book viewed",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: { book_id },
    });

    const copies = await getCopiesByBookId(book_id, { archived: false });
    return { copies };
  },
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const body = validateBody(req.body, createCopySchema);
    const copy = await createCopy(body);

    await createEventLog({
      req,
      event: "Copy created",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { ...body, copy_id: copy.copy_id },
    });

    return { message: "Created copy", copy };
  },
});
