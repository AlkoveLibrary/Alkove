import formidable from "formidable";
import fs from "fs/promises";
import { ErrorType } from "constants/errors";
import { storeFile } from "backend/file";
import { NextApiRequest } from "next";

export async function parseAndStoreImageUpload(
  req: NextApiRequest,
): Promise<string> {
  const form = formidable({
    filter: ({ mimetype }) => !!mimetype?.startsWith("image/"),
  });

  const [, files] = await form.parse(req).catch(() => {
    throw new Error(ErrorType.BAD_REQUEST, {
      cause: "Failed to parse form data",
    });
  });

  const file = files.file?.[0];

  if (!file) {
    throw new Error(ErrorType.BAD_REQUEST, {
      cause: "Invalid or missing image file",
    });
  }

  const ext = "." + file.mimetype!.split("/")[1];
  const buffer = await fs.readFile(file.filepath);
  const stored = await storeFile(buffer, "upload/", ext);

  // Delete the temp file off disk
  await fs.unlink(file.filepath);

  return stored;
}
