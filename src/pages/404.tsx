import { Box, Typography, Button, Paper } from "@mui/material";
import { useRouter } from "next/router";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function Custom404() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Page Not Found - {LIBRARY_NAME}</title>
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
          <Typography variant="h2" color="primary" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The page you are looking for does not exist.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/")}
          >
            Go Home
          </Button>
        </Paper>
      </Box>
    </>
  );
}
