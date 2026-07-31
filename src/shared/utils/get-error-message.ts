import type { AxiosError } from "axios";
import type { ApiError } from "../types";
import { ApiCustomError } from "../errors/api-error";

export const getErrorMessage = (error: unknown) => {
  if (!error) return "Unknown Error";

  if (error instanceof ApiCustomError) return error.message;

  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data.message || axiosError.message || "Something went wrong";
};
