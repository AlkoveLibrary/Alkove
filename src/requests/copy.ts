import { axiosClient } from "util/axios";

export const editCopyRequest = async (
  copy_id: string,
  copyData: {
    location: string | null;
    condition: string | null;
    notes: string | null;
  },
) => {
  const response = await axiosClient.post("staff/copies/" + copy_id, copyData);
  return response.data;
};

export const deleteCopyRequest = async (copy_id: string) => {
  const response = await axiosClient.delete("staff/copies/" + copy_id);
  return response.data;
};

export const placeHoldRequest = async (copy_id: string) => {
  const response = await axiosClient.post("web-access/hold", { copy_id });
  return response.data;
};

export const cancelHoldRequest = async (copy_id: string) => {
  const response = await axiosClient.delete("web-access/hold", {
    data: { copy_id },
  });
  return response.data;
};

export const staffPlaceHoldRequest = async (
  user_id: string,
  copy_id: string,
) => {
  const response = await axiosClient.post("staff/holds", { user_id, copy_id });
  return response.data;
};

export const staffCancelHoldRequest = async (transaction_id: string) => {
  const response = await axiosClient.delete("staff/holds", {
    data: { transaction_id },
  });
  return response.data;
};

export const archiveCopyRequest = async (copy_id: string) => {
  const response = await axiosClient.patch("staff/copies/" + copy_id);
  return response.data;
};
