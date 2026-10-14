import { useFormikContext } from "formik";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { scrollToTop } from "util/scroll-to-top";

const FormError = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isValid, isValidating, isSubmitting } = useFormikContext();

  useEffect(() => {
    if (!isValid && !isValidating && isSubmitting) {
      scrollToTop();
      enqueueSnackbar("Please fix the errors in the form before submitting.", {
        variant: "warning",
      });
    }
  }, [enqueueSnackbar, isSubmitting, isValid, isValidating]);

  return null;
};

export default FormError;
