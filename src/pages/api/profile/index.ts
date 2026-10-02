import type { NextApiRequest } from "next";
import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { updateUser } from "backend/user";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";
import { validateBody } from "util/validate-body";
import { updateProfileSchema } from "schema/user";

export default requestHandler({
  patch: async (req: NextApiRequest) => {
    const user = await authenticateUser(req);

    const { first_name, last_name } = validateBody(
      req.body,
      updateProfileSchema,
    );

    await createEventLog({
      req,
      event: "Self profile updated",
      type: "user",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        new: {
          first_name,
          last_name,
        },
        old: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
    });

    await updateUser(user.user_id, { first_name, last_name });

    return { message: "Profile updated successfully" };
  },
});
