import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { BookCard } from "components/BookCard";
import { PAGES } from "constants/pages";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { BooksWithHistory } from "types/book";
import { formatDate } from "util/format-date";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BooksPage() {
  const router = useRouter();
  const { data: books } = useSWR<{ books: BooksWithHistory }>(
    "web-access/my-books",
  );

  const transactions =
    books?.books.flatMap((book) =>
      book.Copy.map((c) => c.Transaction).flat(),
    ) ?? [];

  transactions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const previousTransactions = transactions.filter(
    (t) => t.checked_in_at !== null || t.hold_cancelled_at !== null,
  );

  const hasCancelledHolds = previousTransactions.some(
    (t) => t.hold_cancelled_at !== null,
  );
  const getBook = (copy_id: string) => {
    for (const book of books?.books ?? []) {
      for (const copy of book.Copy) {
        if (copy.copy_id === copy_id) {
          return book;
        }
      }
    }
    return null;
  };

  const getTransactionDate = (book_id: string) => {
    for (const book of books?.books ?? []) {
      if (book.book_id === book_id) {
        for (const copy of book.Copy) {
          for (const transaction of copy.Transaction) {
            if (
              transaction.checked_out_at !== null &&
              transaction.checked_in_at === null
            ) {
              return formatDate(transaction.checked_out_at, true);
            }
          }
        }
      }
    }
    return null;
  };

  const getHoldDate = (book_id: string) => {
    for (const book of books?.books ?? []) {
      if (book.book_id === book_id) {
        for (const copy of book.Copy) {
          for (const transaction of copy.Transaction) {
            if (
              transaction.held_at !== null &&
              transaction.hold_cancelled_at === null &&
              transaction.checked_out_at === null
            ) {
              return formatDate(transaction.held_at, true);
            }
          }
        }
      }
    }
    return null;
  };

  const heldBooks =
    books?.books.filter((book) =>
      book.Copy.some((copy) =>
        copy.Transaction.some(
          (t) =>
            t.held_at !== null &&
            t.hold_cancelled_at === null &&
            t.checked_out_at === null,
        ),
      ),
    ) ?? [];

  const checkedOutBooks =
    books?.books.filter((book) =>
      book.Copy.some((copy) =>
        copy.Transaction.some(
          (t) => t.checked_out_at !== null && t.checked_in_at === null,
        ),
      ),
    ) ?? [];

  return (
    <>
      <Head>
        <title>My Books - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            My Books
          </Typography>
          {heldBooks.length === 0 && checkedOutBooks.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              You have no books currently checked out.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {heldBooks.map((book) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  key={`hold-${book.book_id}`}
                >
                  <BookCard
                    book={book}
                    onHold={getHoldDate(book.book_id) ?? "Unknown"}
                  />
                </Grid>
              ))}
              {checkedOutBooks.map((book) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.book_id}>
                  <BookCard
                    book={book}
                    checkedOut={getTransactionDate(book.book_id) ?? "Unknown"}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        <Box sx={{ p: 1 }} />
        <Typography variant="h5" gutterBottom>
          Past Transactions
        </Typography>
        <Box sx={{ p: 0.5 }} />
        {previousTransactions.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            You have no past transactions.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Book Title</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Checked Out</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Checked In</b>
                    </TableCell>
                    {hasCancelledHolds && (
                      <TableCell align="right">
                        <b>Hold Cancelled</b>
                      </TableCell>
                    )}
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previousTransactions.map((row) => (
                    <TableRow
                      key={row.transaction_id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      onClick={() =>
                        router.push(
                          PAGES.OPAC.BOOK.replace(
                            "[book_id]",
                            getBook(row.copy_id)?.book_id ?? "",
                          ),
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell component="th" scope="row">
                        {getBook(row.copy_id)?.title ?? "Unknown Book"}
                      </TableCell>
                      <TableCell align="right">
                        {formatDate(row.checked_out_at, true)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDate(row.checked_in_at, true)}
                      </TableCell>
                      {hasCancelledHolds && (
                        <TableCell align="right">
                          {formatDate(row.hold_cancelled_at, true)}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          View Book
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Box>
    </>
  );
}
