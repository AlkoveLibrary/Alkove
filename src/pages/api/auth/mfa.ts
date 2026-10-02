import { EventAction } from "@prisma/client";
import { getUserMfaEnabled, setUserMfaEnabled } from "backend/auth";
import { authenticateUser, validateToken } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { ErrorType } from "constants/errors";
import { ROLE_IDS } from "constants/roles";
import { createEventLog } from "util/create-event-log";
import { validateIp } from "util/validate-ip";
import { mfaEnabledSchema } from "schema/auth";
import { validateBody } from "util/validate-body";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);

    await createEventLog({
      req,
      action: EventAction.read,
      event: "Get self MFA status",
      type: "auth",
      user_id: user.user_id,
    });

    const mfaEnabled = await getUserMfaEnabled(user.auth_id);

    return { mfaEnabled };
  },
  post: async (req) => {
    const user = await authenticateUser(req);

    const { enabled } = validateBody(req.body, mfaEnabledSchema);

    const ip = validateIp(req);
    const token = validateToken(req);

    if (user.role_id === ROLE_IDS.ADMIN) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Administrators must have MFA enabled",
      });
    }

    await setUserMfaEnabled(user.auth_id, enabled, token, ip);

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Self MFA setting changed",
      type: "auth",
      user_id: user.user_id,
      data: { old: !enabled, new: enabled },
    });

    return { success: true };
  },
});
