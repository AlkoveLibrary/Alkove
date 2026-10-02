import { axiosClient } from "util/axios";

export const createStandaloneCoverRequest = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post<{ cover_id: string }>(
    `staff/books/cover`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};
export const createCoverRequest = async (file: File, book_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post(
    `staff/books/${book_id}/cover`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const deleteCoverRequest = async (cover_id: string) => {
  const response = await axiosClient.delete(`staff/covers/${cover_id}`);
  return response.data;
};
