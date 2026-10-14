import { requestHandler } from "backend/request-handler";

import { getAllBooksWithCopyCountOpac } from "backend/book";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    await createEventLog({
      req,
      event: "Read book list",
      type: "opac",
      action: EventAction.read,
    });
    const books = await getAllBooksWithCopyCountOpac();

    return { message: "Books fetched", books };
  },
});
