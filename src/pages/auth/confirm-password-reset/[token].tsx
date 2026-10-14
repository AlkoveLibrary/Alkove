import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/router";
import { axiosClient } from "util/axios";
import LoginForm from "components/LoginForm";
import { useFormik } from "formik";
import { object, ref, string } from "yup";
import { getEmailFromToken } from "util/email-from-token";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

const validationSchema = object({
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirm: string()
    .required("Please confirm your password")
    .oneOf([ref("password")], "Passwords do not match"),
});

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const { token } = router.query as { token: string };

  const email = getEmailFromToken(token);

  const [submittedPassword, setSubmittedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm: "",
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        await axiosClient.post("auth/confirm-password", {
          token,
          password: values.password,
        });
        setSubmittedPassword(values.password);
        setDone(true);
      } catch (e) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message ?? "Failed to set password.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (done) {
    return (
      <>
        <Container component="main" maxWidth="xs">
          <Card
            elevation={1}
            sx={{
              mt: 8,
              mb: 2,
              borderRadius: 2,
              border: "1px solid #c8e6c9",
              background: "#f9fbe7",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 2,
              }}
            >
              <CheckCircleIcon
                sx={{ color: "success.main", fontSize: 32, mb: 0.5 }}
              />
              <Typography
                variant="subtitle1"
                sx={{ color: "success.main", fontWeight: 600, mb: 0.5 }}
              >
                Password changed!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center" }}
              >
                You can now log in with your new password.
              </Typography>
            </CardContent>
          </Card>
        </Container>
        <LoginForm
          initialEmail={email ?? ""}
          initialPassword={submittedPassword}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Set Your Password - {LIBRARY_NAME}</title>
      </Head>
      <Container component="main" maxWidth="xs">
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography component="h1" variant="h5">
            Set Your Password
          </Typography>
          {email && (
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          )}
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.submitCount > 0 && Boolean(formik.errors.password)}
            helperText={formik.submitCount > 0 ? formik.errors.password : ""}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            id="confirm"
            name="confirm"
            value={formik.values.confirm}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.submitCount > 0 && Boolean(formik.errors.confirm)}
            helperText={formik.submitCount > 0 ? formik.errors.confirm : ""}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={
              !formik.values.password || !formik.values.confirm || loading
            }
          >
            {loading ? "Setting..." : "Set Password"}
          </Button>
        </Box>
      </Container>
    </>
  );
}
