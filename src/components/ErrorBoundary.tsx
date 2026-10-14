import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { logErrorFrontend } from "../util/log-error-frontend";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    // Serialize error object fully
    const serialized = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...Object.getOwnPropertyNames(error)
        .filter((key) => !["name", "message", "stack"].includes(key))
        .reduce(
          (acc, key) => {
            acc[key] = (error as any)[key];
            return acc;
          },
          {} as Record<string, unknown>,
        ),
    };
    logErrorFrontend({
      url: typeof window !== "undefined" ? window.location.href : "UNKNOWN",
      error: serialized,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <Paper
            elevation={3}
            sx={{ p: 6, textAlign: "center", maxWidth: 400 }}
          >
            <Typography variant="h2" color="primary" gutterBottom>
              Error
            </Typography>
            <Typography variant="h5" gutterBottom>
              An unexpected error has occurred.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }} color="error">
              {this.state.error?.message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              color="primary"
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              onClick={() => window.location.assign("/")}
            >
              Go Home
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
