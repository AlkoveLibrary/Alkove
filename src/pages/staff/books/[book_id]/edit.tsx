import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";

import { BookWithCopies } from "types/book";
import { Form, Formik } from "formik";
import { EditBookFields } from "components/EditBookFields";
import { editBookSchema } from "schema/book";
import { deleteBookRequest, editBookRequest } from "requests/book";
import { PAGES } from "constants/pages";
import { enqueueSnackbar } from "notistack";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function EditBookPage() {
  const router = useRouter();
  const { book_id } = router.query as { book_id: string };

  const { data, isLoading } = useSWR<{ book: BookWithCopies | null }>(
    book_id ? `opac/books/${book_id}` : null,
  );

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const book = data?.book;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteBookRequest(book_id);
      enqueueSnackbar("Book deleted successfully", { variant: "success" });
      router.push(PAGES.STAFF.BOOKS.HOME);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      enqueueSnackbar(msg ?? "Failed to delete book", { variant: "error" });
      setDeleteLoading(false);
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

  return (
    <>
      <Head>
        <title>Edit Book - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Dialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
        >
          <DialogTitle>Delete Book</DialogTitle>
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography gutterBottom>
              Are you sure you want to delete &quot;{book.title}&quot;? This
              cannot be undone.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </Box>
          </Box>
        </Dialog>
        <IconButton
          onClick={() =>
            router.push(
              PAGES.STAFF.BOOKS.BOOK.HOME.replace("[book_id]", book.book_id),
            )
          }
          sx={{ mb: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Formik
          initialValues={{
            title: book.title,
            author: book.author ?? undefined,
            isbn: book.isbn ?? "",
            publication_year: book.publication_year ?? undefined,
            format: book.format ?? undefined,
            publisher: book.publisher ?? undefined,
            page_count: book.page_count ?? undefined,
            edition: book.edition ?? undefined,
            dewey_decimal: book.dewey_decimal ?? undefined,
            edition_year: book.edition_year ?? undefined,
            description: book.description ?? "",
            genre: book.genre ?? "",
          }}
          onSubmit={async (values) => {
            try {
              await editBookRequest(book_id, values);
              router.push(
                PAGES.STAFF.BOOKS.BOOK.HOME.replace("[book_id]", book_id),
              );
              enqueueSnackbar("Book updated successfully", {
                variant: "success",
              });
            } catch {
              enqueueSnackbar(
                "Failed to update book. Please check your inputs and try again.",
                { variant: "error" },
              );
            }
          }}
          validationSchema={editBookSchema}
        >
          {({ isSubmitting }) => (
            <Form>
              <EditBookFields
                hasCopies={book.Copy.length > 0}
                lockIsbn
                onDeleteClick={() => setConfirmDeleteOpen(true)}
              />
              <Grid size={12} sx={{ py: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}
