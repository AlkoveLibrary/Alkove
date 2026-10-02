import axios from "axios";
import { AxiosError } from "axios";
import { AxiosRequestConfig } from "axios";
import { PAGES } from "constants/pages";
import { isGatedRoute } from "./is-gated-route";

export const axiosClient = axios.create({
  baseURL: `/api/`,
});

// Fetcher for use with useSWR
export const fetcher = async <T>(url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await axiosClient.get<T>(url, config);
    return response.data;
  } catch (error: unknown) {
    const { response } = error as AxiosError;

    const gatedRoute = isGatedRoute(window.location.pathname);

    if (response?.status === 401) {
      if (!(url === "auth/self" && !gatedRoute)) {
        window.location.href = PAGES.LOGIN;
      }
    }
    throw response?.data;
  }
};
