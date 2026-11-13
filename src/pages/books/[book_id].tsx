import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
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
import { STAFF } from "constants/roles";
import { PAGES } from "constants/pages";

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
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold" }}
              gutterBottom={!book.subtitle}
            >
              {book.title}
            </Typography>
            {book.subtitle && (
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ opacity: 0.7, fontStyle: "italic" }}
                gutterBottom
              >
                {book.subtitle}
              </Typography>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 2.5,
              }}
            >
              {book.author ? (
                <Typography variant="h6" color="text.secondary">
                  {book.author}
                </Typography>
              ) : (
                <Box />
              )}
              {user && STAFF.includes(user.role_id) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{ flexShrink: 0 }}
                  onClick={() =>
                    router.push(
                      PAGES.STAFF.BOOKS.BOOK.HOME.replace(
                        "[book_id]",
                        book.book_id,
                      ),
                    )
                  }
                >
                  View as Staff
                </Button>
              )}
            </Box>
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
