import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { getAllBooksWithCover } from "backend/book";
import { BookWithCover } from "types/book";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Viewed books list",
      type: "admin",
      action: EventAction.read,
    });

    const books = (await getAllBooksWithCover()) as BookWithCover[];
    return { message: "Books fetched", books };
  },
});
