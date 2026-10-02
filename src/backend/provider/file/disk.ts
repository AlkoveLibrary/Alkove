import { randomUUID } from "crypto";
import { promises as fs } from "fs";

const basePath = process.env.FILE_STORAGE_BASE_PATH;

export const storeFileDisk = async (
  fileBuffer: Buffer,
  filepath: string,
  extension: string,
) => {
  const file_identifier = randomUUID();
  const fullFilename = `${basePath}${filepath}${file_identifier}${extension}`;

  const filename = `${filepath}${file_identifier}${extension}`;

  await fs.writeFile(fullFilename, fileBuffer);
  return filename;
};

export const retrieveFileDisk = async (filename: string) => {
  const fileBuffer = await fs.readFile(basePath + filename);
  return fileBuffer;
};
