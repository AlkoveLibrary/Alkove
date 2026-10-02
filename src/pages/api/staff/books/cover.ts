import { requestHandler } from "backend/request-handler";
import { createUploadedCover } from "backend/cover";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { parseAndStoreImageUpload } from "util/parse-uploaded-image";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);
    
    const file_path = await parseAndStoreImageUpload(req);
    const cover = await createUploadedCover(file_path);

    await createEventLog({
      req,
      event: "Cover uploaded",
      type: "cover",
      action: EventAction.write,
      user_id: user.user_id,
      data: { cover_id: cover.cover_id },
    });

    return { cover_id: cover.cover_id };
  },
});
