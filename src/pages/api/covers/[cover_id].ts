import { requestHandler } from "backend/request-handler";

import { NextApiRequest, NextApiResponse } from "next";
import { ErrorType } from "constants/errors";
import { retrieveFile } from "backend/file";
import { getCoverById } from "backend/cover";

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
    const cover_id = req.query.cover_id;

    if (!cover_id || typeof cover_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, { cause: "No cover_id provided" });
    }

    const cover = await getCoverById(cover_id);

    if (!cover) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Cover not found" });
    }

    const image = await retrieveFile(cover.file_path);

    sendFile(image, cover.file_path, res);
  },
});
