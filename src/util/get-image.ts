import axios from "axios";

export async function getImage(
  url: string,
  headers?: Record<string, string>,
): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers,
  });
  return Buffer.from(response.data);
}
