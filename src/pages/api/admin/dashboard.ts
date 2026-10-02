import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { validateRole } from "util/validate-role";
import { ADMINISTRATOR_ONLY, ROLE_IDS } from "constants/roles";
import { getAllUsers } from "backend/user";
import { UserKpiData } from "types/user";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, ADMINISTRATOR_ONLY);

    await createEventLog({
      req,
      event: "Viewed admin dashboard",
      type: "admin",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const users = await getAllUsers();
    const userCount = users.length;
    const webUserCount = users.filter(
      (user) => user.role_id === ROLE_IDS.USER && user.auth_id,
    ).length;
    const baseUserCount = users.filter(
      (user) => user.role_id === ROLE_IDS.USER && !user.auth_id,
    ).length;
    const staffUserCount = users.filter(
      (user) => user.role_id === ROLE_IDS.STAFF,
    ).length;
    const adminUserCount = users.filter(
      (user) => user.role_id === ROLE_IDS.ADMIN,
    ).length;

    return {
      userCount,
      webUserCount,
      baseUserCount,
      staffUserCount,
      adminUserCount,
    } as UserKpiData;
  },
});
