import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getAllBooksWithCopyCount } from "backend/book";
import { BookResult } from "types/book";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed books list",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const books = (await getAllBooksWithCopyCount()) as BookResult[];
    return { message: "Books fetched", books };
  },
});
