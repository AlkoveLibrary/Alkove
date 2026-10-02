import { axiosClient } from "util/axios";

export const search = async (body: { isbn: string }) => {
  const response = await axiosClient.post("staff/openlibrary", body);
  return response.data;
};
