import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { errorLogGetAll } from "backend/error-log";
import { requestHandler } from "backend/request-handler";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { createEventLog } from "util/create-event-log";
import { validateRole } from "util/validate-role";

export default requestHandler({
  async get(req, res) {
    const user = await authenticateUser(req);

    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Viewed error logs",
      type: "admin",
      action: EventAction.read,
    });

    const logs = await errorLogGetAll();
    res.status(200).json(logs);
  },
});
