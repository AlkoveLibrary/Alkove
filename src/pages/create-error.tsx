import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

function CrashComponent() {
  throw new Error("Test frontend crash error");
}

export default function CreateErrorPage() {
  const [crash, setCrash] = useState(false);

  return (
    <>
      <Head>
        <title>Create Test Error - {LIBRARY_NAME}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: "center", maxWidth: 400 }}>
          <Typography variant="h4" gutterBottom>
            Create Frontend Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Press the button below to trigger a test frontend crash error.
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => setCrash(true)}
          >
            Trigger Crash
          </Button>
          <Box sx={{ mt: 4 }}>
            {/* @ts-expect-error: CrashComponent intentionally throws and is not a valid JSX component for error boundary testing */}
            {crash && <CrashComponent />}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
