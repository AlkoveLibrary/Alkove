import { requestHandler } from "backend/request-handler";

import { NextApiRequest, NextApiResponse } from "next";
import { ErrorType } from "constants/errors";
import { getOrCreateOpenLibraryCover } from "backend/openlibrary";
import { retrieveFile } from "backend/file";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";
import { authenticateUser } from "backend/authenticate-user";
import { STAFF } from "constants/roles";
import { validateRole } from "util/validate-role";

const sendFile = (
  file: Buffer | ArrayBuffer,
  filename: string,
  res: NextApiResponse,
) => {
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Content-Disposition", `inline; filename=\"${filename}\"`);
  if (Buffer.isBuffer(file)) {
    res.status(200).send(file);
  } else {
    res.status(200).send(Buffer.from(file));
  }
};

export default requestHandler({
  get: async (req: NextApiRequest, res: NextApiResponse) => {
    // This is an authenticated route because only staff are going
    // to be using covers from OpenLibrary. Once the staff creates it,
    // it will be cached locally and served publicly from our own server.
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const cover_id = req.query.cover_id as string;

    if (!cover_id) {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "No cover_id provided" });
    }

    const coverIdInt = parseInt(cover_id, 10);
    if (isNaN(coverIdInt)) {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "cover_id must be an integer",
      });
    }

    const { cover, image } = await getOrCreateOpenLibraryCover(coverIdInt);

    await createEventLog({
      req,
      event: image
        ? "OpenLibrary cover fetch and store"
        : "OpenLibrary cover served from cache",
      type: "cover",
      action: image ? EventAction.write : EventAction.read,
      user_id: user.user_id,
      data: { cover_id },
    });

    sendFile(image ?? (await retrieveFile(cover.file_path)), cover_id, res);
  },
});
