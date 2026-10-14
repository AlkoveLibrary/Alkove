import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { getPocketbaseAuthLogs } from "backend/provider/auth/pocketbase";
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
      event: "Viewed authentication logs",
      type: "admin",
      action: EventAction.read,
    });

    const { page = "1", perPage = "10", filter = "" } = req.query;
    const logs = await getPocketbaseAuthLogs({
      page: Number(page),
      perPage: Number(perPage),
      filter: String(filter),
    });
    res.status(200).json(logs);
  },
});
