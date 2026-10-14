import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { Role, User } from "@prisma/client";
import { ROLE_IDS } from "constants/roles";
import { Formik, Form } from "formik";
import { useSnackbar } from "notistack";
import { adminCreateUserRequest, adminUpdateUserRequest } from "requests/user";
import { adminCreateUserSchema } from "schema/user";
import useSWR from "swr";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  user?: User;
}

export default function AdminUserDialog({
  open,
  onClose,
  onCreated,
  user,
}: CreateUserDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { data: roles } = useSWR<{ roles: Role[] }>("admin/roles");

  const editMode = Boolean(user);
  const disableEmail = Boolean(user?.auth_id);

  const initialValues = user
    ? {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email ?? "",
        role_id: user.role_id,
      }
    : {
        first_name: "",
        last_name: "",
        email: "",
        role_id: "",
      };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editMode ? "Edit User" : "Create User"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={adminCreateUserSchema}
        onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
          try {
            if (user) {
              const newValues = {
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim() || null,
                role_id: values.role_id,
              };
              const response = await adminUpdateUserRequest(
                user.user_id,
                newValues,
              );
              enqueueSnackbar(response.message, {
                variant: "success",
              });
            } else {
              await adminCreateUserRequest({
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim() || undefined,
                role_id: values.role_id,
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
                label="Email"
                name="email"
                fullWidth
                size="small"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={disableEmail}
              />
              <TextField
                select
                label="Role"
                name="role_id"
                fullWidth
                size="small"
                value={values.role_id}
                onChange={handleChange}
                error={touched.role_id && Boolean(errors.role_id)}
                helperText={touched.role_id && errors.role_id}
              >
                {roles?.roles.map((role) => (
                  <MenuItem
                    key={role.role_id}
                    value={role.role_id}
                    disabled={role.role_id === ROLE_IDS.USER && !editMode}
                  >
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
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
