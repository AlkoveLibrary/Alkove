import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateBody } from "util/validate-body";
import { createBookRequestSchema } from "schema/book";
import { sendBookRequest } from "backend/book-request";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);

    const body = validateBody(req.body, createBookRequestSchema);

    await sendBookRequest({
      title: body.title,
      author: body.author,
      notes: body.notes,
      user_id: user.user_id,
    });

    await createEventLog({
      req,
      event: "Book request created",
      type: "web-access",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        title: body.title,
        author: body.author,
        notes: body.notes,
      },
    });

    return { message: "Book request created successfully" };
  },
});
