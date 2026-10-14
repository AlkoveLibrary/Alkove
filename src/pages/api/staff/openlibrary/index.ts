import type { NextApiRequest } from "next";

import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { searchBooks } from "backend/openlibrary";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";
import { searchOpenLibrarySchema } from "schema/book";
import { validateBody } from "util/validate-body";

export default requestHandler({
  post: async (req: NextApiRequest) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { isbn } = validateBody(req.body, searchOpenLibrarySchema);

    await createEventLog({
      req,
      event: "Searched OpenLibrary",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: {
        isbn,
      },
    });

    const searchResults = await searchBooks(isbn);

    return searchResults;
  },
});
