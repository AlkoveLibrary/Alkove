import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { getEventLogs } from "backend/event-log";
import { requestHandler } from "backend/request-handler";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { createEventLog } from "util/create-event-log";
import { validateRole } from "util/validate-role";

export default requestHandler({
  async get(req) {
    const user = await authenticateUser(req);

    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Viewed event logs",
      type: "admin",
      action: EventAction.read,
    });

    const logs = await getEventLogs();

    return { logs };
  },
});
