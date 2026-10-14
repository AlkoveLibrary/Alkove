import { getAdminClient, getPocketbaseUrl } from "../pocketbase-util";
import { getImage } from "util/get-image";

export const storeFilePocketbase = async (
  fileBuffer: Buffer,
  filepath: string,
  _extension: string,
) => {
  const pb = await getAdminClient();

  const collectionName = filepath.replaceAll("/", "");
  const record = await pb.collection(collectionName).create({
    image: new Blob([new Uint8Array(fileBuffer)]),
  });

  if (!record || !record.id || !record.image) {
    throw new Error("Failed to store file in PocketBase");
  }

  const fullPath = `/api/files/${collectionName}/${record.id}/${record.image}`;
  return fullPath;
};

export const retrieveFilePocketbase = async (filename: string) => {
  const baseUrl = getPocketbaseUrl();
  const fullUrl = `${baseUrl}${filename}`;
  const image = await getImage(fullUrl);
  return image;
};
