import { requestHandler } from "backend/request-handler";

import { NextApiRequest, NextApiResponse } from "next";
import { ErrorType } from "constants/errors";
import { fetchOpenLibraryCoverBuffer } from "backend/openlibrary";
import { createCover, getCoverByOpenlibraryCoverId } from "backend/cover";
import { retrieveFile, storeFile } from "backend/file";
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

    // Try to get the image from PocketBase
    const cover = await getCoverByOpenlibraryCoverId(coverIdInt);
    if (!cover) {
      await createEventLog({
        req,
        event: "OpenLibrary cover fetch and store",
        type: "cover",
        action: EventAction.write,
        user_id: user.user_id,
        data: { cover_id },
      });
      // If not found, try OpenLibrary and upload
      let openLibraryCover = null;
      try {
        openLibraryCover = await fetchOpenLibraryCoverBuffer(cover_id);
      } catch (error) {
        if ((error as { status?: number })?.status === 404)
          throw new Error(ErrorType.NOT_FOUND, {
            cause: "Cover not found in OpenLibrary",
          });
      }
      if (!openLibraryCover) {
        throw new Error(ErrorType.NOT_FOUND, {
          cause: "Cover not found in OpenLibrary",
        });
      }

      const filepath = "cache/";
      const filename = await storeFile(openLibraryCover, filepath, ".jpg");
      await createCover(coverIdInt, filename);
      sendFile(openLibraryCover, cover_id, res);
    } else {
      await createEventLog({
        req,
        event: "OpenLibrary cover served from cache",
        type: "cover",
        action: EventAction.read,
        user_id: user.user_id,
        data: { cover_id },
      });

      const imageResult = await retrieveFile(cover.file_path);
      sendFile(imageResult, cover_id, res);
    }
  },
});
