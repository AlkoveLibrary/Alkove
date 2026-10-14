import React, { useContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MFAInput from "./MFAInput";
import { useRouter } from "next/router";
import { PAGES } from "constants/pages";
import { axiosClient } from "util/axios";
import AuthContext from "context/AuthContext";
import { loginRedirect } from "util/login-redirect";

import { MfaData } from "types/auth";
import { LIBRARY_NAME } from "config/config";

type Props = {
  initialEmail?: string;
  initialPassword?: string;
};

const LoginForm = ({ initialEmail = "", initialPassword = "" }: Props) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [MFARequired, setMFARequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaData, setMfaData] = useState<MfaData | null>(null);
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { login, loginWithMfa, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      loginRedirect(user, router);
    }
  }, [user, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setForgotError(null);
    if (MFARequired) {
      if (!mfaCode || !mfaData) {
        setError("Please enter the one-time password sent to your email.");
        setLoading(false);
        return;
      }
      try {
        await loginWithMfa({ mfaCode, mfaData });
        enqueueSnackbar("Login successful!", { variant: "success" });
      } catch (e) {
        const error = e as unknown as {
          response?: { data?: { message?: string } };
        };

        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("Login failed. Please check your one-time password.");
        }
      }
    } else {
      try {
        const result = await login(email, password);

        if (result?.mfaRequired) {
          setMFARequired(true);
          setMfaData(result.mfaData);
        }
        enqueueSnackbar("Login successful!", { variant: "success" });
      } catch (e) {
        const error = e as unknown as {
          response?: { data?: { message?: string } };
        };
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("Login failed. Please check your credentials.");
        }
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      await axiosClient.post("auth/forgot-password", { email });
      enqueueSnackbar(
        "If account exists, a password reset email has been sent.",
      );
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } } };
      setForgotError(
        error.response?.data?.message || "Failed to send password reset email.",
      );
    }
    setForgotLoading(false);
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to{" "}
          <Box component="span" color="secondary.main">
            {LIBRARY_NAME}
          </Box>
          !
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          Sign in here for User Web Access and Staff Access.
        </Typography>
        <Box sx={{ mt: 1 }}>
          {MFARequired ? (
            <>
              <Alert severity="info" sx={{ mb: 2, mt: 3 }}>
                Multi-factor authentication is required. An email has been sent
                with a one-time password.
              </Alert>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Enter One-Time Password
                </Typography>
                <MFAInput
                  value={mfaCode}
                  onChange={(val) => {
                    setMfaCode(val);
                    setError(null);
                  }}
                  length={8}
                  disabled={loading}
                />
              </Box>
            </>
          ) : (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
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
              {forgotError && (
                <Typography
                  color="error"
                  variant="body2"
                  align="center"
                  sx={{ mt: 2, mb: 1 }}
                >
                  {forgotError}
                </Typography>
              )}
            </>
          )}

          {error && (
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          )}
          <Button
            onClick={handleLogin}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              loading ||
              (MFARequired ? mfaCode.length !== 8 : !email || !password)
            }
          >
            Sign In
          </Button>
          {!MFARequired ? (
            <>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled={!email || forgotLoading}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </Button>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 6,
                  mb: 3,
                  width: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ flexGrow: 1 }}
                >
                  or browse our public catalog without signing in
                </Typography>
              </Box>
              <Button
                onClick={() => router.push(PAGES.OPAC.HOME)}
                fullWidth
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Browse Catalog
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setMFARequired(false);
                setMfaData(null);
                setMfaCode("");
                setError(null);
                setForgotError(null);
              }}
              variant="text"
              fullWidth
            >
              Back to login
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
