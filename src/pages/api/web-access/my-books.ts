import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";

import { getAllBooksForUser } from "backend/book";
import { Book, Copy, EventAction, Transaction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);

    const books = (await getAllBooksForUser(user.user_id)) as (Book & {
      Copy: (Copy & { Transaction: Transaction[] })[];
    })[];

    await createEventLog({
      req,
      event: "Fetched my books",
      type: "web-access",
      action: EventAction.read,
      user_id: user.user_id,
    });

    return { message: "Books fetched", books };
  },
});
