import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getCoverByOpenlibraryCoverId } from "backend/cover";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { cover_id } = req.query as { cover_id: string };

    const coverIdNumber = parseInt(cover_id, 10);

    if (isNaN(coverIdNumber)) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "Invalid cover_id, must be a number",
      });
    }

    const cover = await getCoverByOpenlibraryCoverId(coverIdNumber);

    if (!cover) {
      throw new Error(ErrorType.NOT_FOUND, {
        cause: "Cover not found",
      });
    }

    await createEventLog({
      req,
      event: "OpenLibrary cover looked up",
      type: "cover",
      action: EventAction.read,
      user_id: user.user_id,
      data: { cover_id },
    });

    return { cover };
  },
});
