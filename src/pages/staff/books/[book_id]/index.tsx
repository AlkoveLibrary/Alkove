import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { deleteCoverRequest, createCoverRequest } from "requests/cover";
import { setFeaturedRequest } from "requests/book";
import CreateCoverDialog from "components/CreateCoverDialog";
import { CoverFull } from "components/CoverFull";
import { enqueueSnackbar } from "notistack";
import { CreateCopyDialog } from "components/CreateCopyDialog";
import { BookWithCopiesStaff } from "types/book";
import { PAGES } from "constants/pages";
import EditIcon from "@mui/icons-material/Edit";
import { CopyItem } from "components/CopyItem";
import { BookDetailsTable } from "components/BookDetailsTable";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BookDetailPage() {
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const router = useRouter();
  const book_id = router.query.book_id;

  const { data, isLoading, mutate } = useSWR<{
    book: BookWithCopiesStaff | null;
  }>(book_id ? `staff/books/${book_id}` : null);

  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const book = data?.book;

  const [coverDeleteLoading, setCoverDeleteLoading] = useState(false);
  const [coverDeleteError, setCoverDeleteError] = useState<string | null>(null);

  const handleToggleFeatured = async () => {
    if (!book || featuredLoading) return;

    try {
      setFeaturedLoading(true);
      const nextFeatured = !book.featured;
      await setFeaturedRequest(book.book_id, nextFeatured);
      await mutate();
      enqueueSnackbar(
        nextFeatured ? "Book set as featured" : "Book removed from featured",
        { variant: "success" },
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      enqueueSnackbar(msg ?? "Failed to update featured status", {
        variant: "error",
      });
    } finally {
      setFeaturedLoading(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!book?.cover_id) return;
    setCoverDeleteLoading(true);
    setCoverDeleteError(null);
    try {
      await deleteCoverRequest(book.cover_id);
      await mutate();
      enqueueSnackbar("Cover deleted successfully", { variant: "success" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setCoverDeleteError(msg ?? "Failed to delete cover");
    } finally {
      setCoverDeleteLoading(false);
    }
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

  const copies = [...book.Copy].sort((a, b) => {
    if (a.archived !== b.archived) {
      return a.archived ? 1 : -1;
    }

    if (a.available !== b.available) {
      return a.available ? -1 : 1;
    }

    const tA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const tB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return tB - tA;
  });
  if (!book_id || typeof book_id !== "string") {
    return <Typography>Invalid Book ID</Typography>;
  }

  return (
    <>
      <Head>
        <title>Staff - Book Details - {LIBRARY_NAME}</title>
      </Head>
      <Box>
        <CreateCopyDialog
          open={copyDialogOpen}
          handleClose={() => setCopyDialogOpen(false)}
          mutateBook={mutate}
          book_id={book_id}
        />
        <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
          <IconButton
            onClick={() => router.push(PAGES.STAFF.BOOKS.HOME)}
            sx={{ mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              {book.cover_id ? (
                <Box>
                  <CoverFull coverId={book.cover_id} />

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleDeleteCover}
                    disabled={coverDeleteLoading}
                  >
                    {coverDeleteLoading ? "Deleting..." : "Delete Cover"}
                  </Button>
                  {coverDeleteError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {coverDeleteError}
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light"
                        ? theme.palette.grey[200]
                        : theme.palette.grey[900],
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No cover
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setCoverDialogOpen(true)}
                  >
                    Add Cover
                  </Button>
                  <CreateCoverDialog
                    open={coverDialogOpen}
                    onClose={() => setCoverDialogOpen(false)}
                    onSubmit={async (file) => {
                      await createCoverRequest(file, book_id);
                      setCoverDialogOpen(false);
                      mutate();
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                {book.featured && (
                  <StarIcon
                    color="secondary"
                    sx={{ flexShrink: 0, mt: 0.5, fontSize: 36 }}
                  />
                )}
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold" }}
                  gutterBottom
                >
                  {book.title}
                </Typography>
              </Box>
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
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={
                      book.featured ? <StarIcon /> : <StarBorderIcon />
                    }
                    onClick={handleToggleFeatured}
                    disabled={featuredLoading}
                  >
                    {book.featured ? "Remove Featured" : "Set as Featured"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() =>
                      router.push(
                        PAGES.STAFF.BOOKS.BOOK.EDIT.replace(
                          "[book_id]",
                          book_id,
                        ),
                      )
                    }
                  >
                    Edit Book
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ mb: 2 }}>
                {book ? <BookDetailsTable book={book} /> : null}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="h6">
                  Copies ({book.Copy.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setCopyDialogOpen(true)}
                >
                  Add Copy
                </Button>
              </Box>
              {book.Copy.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No copies available.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {copies.map((copy) => (
                    <CopyItem key={copy.copy_id} copy={copy} mutate={mutate} />
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
