import type { NextApiRequest, NextApiResponse } from "next";

import { requestHandler } from "backend/request-handler";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader(
      "Set-Cookie",
      "auth_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
    );

    await createEventLog({
      req,
      event: "Logout",
      type: "auth",
      action: EventAction.read,
    });

    return { message: "Logout successful" };
  },
});
