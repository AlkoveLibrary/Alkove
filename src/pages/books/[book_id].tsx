import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import useSWR from "swr";
import { CoverFull } from "components/CoverFull";
import { BookWithCopies } from "types/book";
import { CopyItem } from "components/CopyItem";
import { BookDetailsTable } from "components/BookDetailsTable";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { useSnackbar } from "notistack";
import { withSnackbar } from "util/snackbar-request";
import { cancelHoldRequest, placeHoldRequest } from "requests/copy";

export default function BookDetailPage() {
  const router = useRouter();
  const { book_id } = router.query as { book_id: string };
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, mutate } = useSWR<{ book: BookWithCopies | null }>(
    book_id ? `opac/books/${book_id}` : null,
  );

  const book = data?.book;

  const handlePlaceHold = async (copy_id: string) => {
    await withSnackbar(
      () => placeHoldRequest(copy_id),
      "Hold placed",
      "Failed to place hold",
      enqueueSnackbar,
    );
    await mutate();
  };

  const handleCancelHold = async (copy_id: string) => {
    await withSnackbar(
      () => cancelHoldRequest(copy_id),
      "Hold cancelled",
      "Failed to cancel hold",
      enqueueSnackbar,
    );
    await mutate();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="text.secondary">
          Book not found.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Book Details - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CoverFull coverId={book.cover_id} />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
              {book.title}
            </Typography>
            {book.author && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {book.author}
              </Typography>
            )}
            <BookDetailsTable book={book} />
            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>
              Copies ({book.Copy.length})
            </Typography>
            {book.Copy.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No copies available.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {book.Copy.map((copy) => (
                  <CopyItem
                    key={copy.copy_id}
                    copy={copy}
                    onPlaceHold={
                      user ? () => handlePlaceHold(copy.copy_id) : undefined
                    }
                    onCancelHold={
                      user ? () => handleCancelHold(copy.copy_id) : undefined
                    }
                  />
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
