import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { ADMINISTRATOR_ONLY, ROLE_IDS } from "constants/roles";
import { getAllUsers } from "backend/user";
import { validateBody } from "util/validate-body";
import { userExportSchema } from "schema/export";
import { USER_EXPORT_FIELDS } from "constants/export";
import { sortRows, toCsv } from "util/to-csv";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    const { fields, sort_by, sort_direction } = validateBody(req.body, userExportSchema);

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Exported users",
      type: "admin",
      action: EventAction.read,
      data: { fields, sort_by, sort_direction },
    });

    const users = await getAllUsers();
    const rows = users.map(({ role, ...rest }) => ({
      ...rest,
      role:
        rest.role_id === ROLE_IDS.USER
          ? rest.auth_id
            ? "Web User"
            : "Local User"
          : role.name,
    }));
    const selectedFields = USER_EXPORT_FIELDS.filter((field) =>
      fields.includes(field.key),
    );

    return { csv: toCsv(selectedFields, sortRows(rows, sort_by, sort_direction)) };
  },
});
