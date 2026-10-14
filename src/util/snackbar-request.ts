import { EnqueueSnackbar } from "notistack";
export const withSnackbar = async (
  requestFunction: () => Promise<unknown>,
  successMessage: string,
  errorMessage: string,
  enqueueSnackbar: EnqueueSnackbar,
) => {
  try {
    await requestFunction();
    enqueueSnackbar(successMessage, { variant: "success" });
  } catch {
    enqueueSnackbar(errorMessage, { variant: "error" });
  }
};
