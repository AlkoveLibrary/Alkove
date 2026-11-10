import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { getEventLogsBetween } from "backend/event-log";
import { requestHandler } from "backend/request-handler";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { validateRole } from "util/validate-role";

export default requestHandler({
  async get(req) {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    const from = new Date(String(req.query.from));
    const to = new Date(String(req.query.to));
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "Invalid date range" });
    }

    await createEventLog({
      req,
      user_id: user.user_id,
      event: "Viewed analytics",
      type: "admin",
      action: EventAction.read,
    });

    const logs = await getEventLogsBetween(from, to);

    return { logs };
  },
});
