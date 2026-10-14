import { retrieveFileDisk, storeFileDisk } from "./provider/file/disk";

export const storeFile = async (
  fileBuffer: Buffer,
  filepath: string,
  extension: string,
) => {
  return await storeFileDisk(fileBuffer, filepath, extension);
};

export const retrieveFile = async (filename: string) => {
  return await retrieveFileDisk(filename);
};
