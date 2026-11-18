import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { getAllBooksForExport } from "backend/book";
import { validateBody } from "util/validate-body";
import { bookExportSchema } from "schema/export";
import { BOOK_EXPORT_FIELDS } from "constants/export";
import { sortRows, toCsv } from "util/to-csv";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    const { fields, sort_by, sort_direction } = validateBody(
      req.body,
      bookExportSchema,
    );

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Exported books",
      type: "admin",
      action: EventAction.read,
      data: { fields, sort_by, sort_direction },
    });

    const books = await getAllBooksForExport();
    const selectedFields = BOOK_EXPORT_FIELDS.filter((field) =>
      fields.includes(field.key),
    );

    return {
      csv: toCsv(selectedFields, sortRows(books, sort_by, sort_direction)),
    };
  },
});
