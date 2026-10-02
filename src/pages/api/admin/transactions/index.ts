import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { getAllTransactions } from "backend/transaction";
import { ADMINISTRATOR_ONLY } from "constants/roles";
import { createEventLog } from "util/create-event-log";
import { validateRole } from "util/validate-role";

export default requestHandler({
  async get(req) {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      action: EventAction.read,
      event: "Viewed transaction logs",
      type: "admin",
      user_id: user.user_id,
    });

    const transactions = await getAllTransactions();
    return { transactions };
  },
});
