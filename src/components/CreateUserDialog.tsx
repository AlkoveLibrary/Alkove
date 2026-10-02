import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Formik, Form } from "formik";
import { useSnackbar } from "notistack";
import { requestCreateUser, requestUpdateUser } from "requests/user";
import { createUserSchema } from "schema/user";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialValues?: {
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
  };
  editMode?: boolean;
  disableEmail?: boolean;
}

export default function CreateUserDialog({
  open,
  onClose,
  onCreated,
  initialValues = { first_name: "", last_name: "", email: "", user_id: "" },
  editMode = false,
  disableEmail = false,
}: CreateUserDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editMode ? "Edit User" : "Create User"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={createUserSchema}
        onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
          try {
            if (editMode) {
              const newValues = {
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim() || null,
              };
              await requestUpdateUser(initialValues.user_id, newValues);
              enqueueSnackbar("User updated successfully", {
                variant: "success",
              });
            } else {
              await requestCreateUser({
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim() || undefined,
              });
              enqueueSnackbar("User created successfully", {
                variant: "success",
              });
              resetForm();
            }

            onCreated();
            onClose();
          } catch (err: unknown) {
            const error = err as {
              message?: string;
              response?: { data?: { message?: string } };
            };
            let msg = "Failed to create user";
            if (error) {
              if (typeof error === "string") {
                msg = error;
              } else if (error.response?.data?.message) {
                msg = error.response.data.message;
              }
            }
            setStatus(msg);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched, handleChange, values, status }) => (
          <Form>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: "16px !important",
              }}
            >
              <TextField
                label="First Name"
                name="first_name"
                fullWidth
                size="small"
                value={values.first_name}
                onChange={handleChange}
                error={touched.first_name && Boolean(errors.first_name)}
                helperText={touched.first_name && errors.first_name}
                autoFocus
              />
              <TextField
                label="Last Name"
                name="last_name"
                fullWidth
                size="small"
                value={values.last_name}
                onChange={handleChange}
                error={touched.last_name && Boolean(errors.last_name)}
                helperText={touched.last_name && errors.last_name}
              />
              <TextField
                label="Email (optional)"
                name="email"
                fullWidth
                size="small"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={disableEmail}
              />
            </DialogContent>
            <DialogActions
              sx={{
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1,
                mt: 1,
              }}
            >
              {status && (
                <Box
                  sx={{
                    color: "error.main",
                    textAlign: "center",
                    mb: 1,
                    fontSize: 14,
                  }}
                >
                  {status}
                </Box>
              )}
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !values.first_name.trim() ||
                    !values.last_name.trim()
                  }
                >
                  {isSubmitting
                    ? editMode
                      ? "Updating..."
                      : "Creating..."
                    : editMode
                      ? "Update"
                      : "Create"}
                </Button>
              </Box>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
