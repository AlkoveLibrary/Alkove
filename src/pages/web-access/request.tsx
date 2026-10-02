import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import React from "react";
import { createBookRequestRequest } from "requests/book";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BooksPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [resultsScreen, setResultsScreen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createBookRequestRequest({
        title,
        author,
        notes,
      });
      setResultsScreen(true);
      setTitle("");
      setAuthor("");
      setNotes("");
    } catch {
      enqueueSnackbar("Failed to submit book request", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Request a Book - {LIBRARY_NAME}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "80vh",
          gap: 2,
          marginTop: 4,
        }}
      >
        <Box sx={{ p: 2, maxWidth: 600 }}>
          {resultsScreen ? (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  sx={{ alignItems: "center", mb: 1.5 }}
                >
                  <CheckCircleRoundedIcon color="success" />
                  <Typography
                    variant="h5"
                    color="success.dark"
                    sx={{ fontWeight: 700 }}
                  >
                    Request Submitted
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{ mb: 0.75 }}
                >
                  Your book request was submitted successfully.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The library staff will review your request.
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 3, pb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={() => setResultsScreen(false)}
                >
                  Back to Form
                </Button>
              </CardActions>
            </Card>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Request a Book
              </Typography>
              <Typography color="text.secondary">
                If you would like to request a book to be added to the library,
                please fill out this form and the staff will be notified.
              </Typography>
              <br />
              <Card sx={{ width: "100%" }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <TextField
                    label="Book Title"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <TextField
                    label="Author"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                  <TextField
                    label="Additional Notes"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    helperText="(Optional) Any additional information or specific edition requests can be included here."
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={!title || !author || submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
