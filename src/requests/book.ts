import { axiosClient } from "util/axios";
import { CreateBookParams, CreateBookRequestParams } from "types/book";

export const createBookRequest = async (bookData: CreateBookParams) => {
  const response = await axiosClient.post("staff/books/create", bookData);
  return response.data;
};

// Naming things is hard
export const createBookRequestRequest = async (
  bookData: CreateBookRequestParams,
) => {
  const response = await axiosClient.post("web-access/book-request", bookData);
  return response.data;
};

export const archiveBookRequestRequest = async (book_request_id: string) => {
  const response = await axiosClient.delete("staff/book-requests", {
    data: { book_request_id },
  });
  return response.data;
};

export const createCopyRequest = async (copyData: {
  book_id: string;
  location?: string;
  condition?: string;
  notes?: string;
}) => {
  const response = await axiosClient.post("staff/copies", copyData);
  return response.data;
};

export const editBookRequest = async (
  book_id: string,
  bookData: Omit<CreateBookParams, "copies" | "cover_id">,
) => {
  const response = await axiosClient.post(
    `staff/books/${book_id}/edit`,
    bookData,
  );
  return response.data;
};

export const deleteBookRequest = async (book_id: string) => {
  const response = await axiosClient.delete<{ message: string }>(
    `staff/books/${book_id}`,
  );
  return response.data;
};

export const setFeaturedRequest = async (
  book_id: string,
  featured: boolean,
) => {
  const response = await axiosClient.post(`staff/books/${book_id}/featured`, {
    featured,
  });
  return response.data;
};
