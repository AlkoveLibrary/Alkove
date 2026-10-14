import { EventAction } from "@prisma/client";
import { getTokenExpiry, refreshToken } from "backend/auth";
import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { updateLastActivity } from "backend/user";
import { createEventLog } from "util/create-event-log";
import { logErrorInternal } from "util/log-error-internal";
import { setAuthTokenCookie } from "util/set-token-cookie";

export default requestHandler({
  get: async (req, res) => {
    const user = await authenticateUser(req);

    await updateLastActivity(user.user_id);

    const token = req.cookies.auth_token as string;

    try {
      const tokenExpiry = getTokenExpiry(token);
      const tokenLifetime = 60 * 60 * 24 * 90; // 90 days in seconds
      const timeToRefresh = 60 * 60 * 24 * 3; // Refresh after 3 days of token lifetime has passed
      const tokenCreation = tokenExpiry - tokenLifetime;
      if (Date.now() / 1000 - tokenCreation > timeToRefresh) {
        const refreshedToken = await refreshToken(token);
        setAuthTokenCookie(refreshedToken, res);
        await createEventLog({
          req,
          event: "User details accessed and token refreshed",
          action: EventAction.read,
          type: "auth",
          user_id: user.user_id,
        });
      } else {
        await createEventLog({
          req,
          event: "User details accessed",
          action: EventAction.read,
          type: "auth",
          user_id: user.user_id,
        });
      }
    } catch (e) {
      await logErrorInternal(req, e);
    }

    return { user };
  },
});
