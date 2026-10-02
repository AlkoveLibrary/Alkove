import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Pagination,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { PAGES } from "constants/pages";
import IconButton from "@mui/material/IconButton";
import BarcodeScannerButton from "components/BarcodeScannerButton";
import { Cover } from "components/Cover";
import { BookResult } from "types/book";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function TransactionPage() {
  const router = useRouter();
  const theme = useTheme();
  const { type } = router.query as { type?: string };
  const isCheckin = type === "checkin";
  const isCheckout = type === "checkout";

  const { data: booksData, isLoading: booksLoading } = useSWR<{
    books: BookResult[];
  }>("staff/books");
  const allBooks = useMemo(() => booksData?.books ?? [], [booksData]);
  const [isbn, setIsbn] = useState("");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const results = useMemo(() => {
    const hasFilter = isbn.trim() || author.trim() || title.trim();
    if (!hasFilter) return null;
    return allBooks.filter((book: BookResult) => {
      const isbnMatch =
        !isbn.trim() ||
        (book.isbn?.toLowerCase().includes(isbn.toLowerCase()) ?? false);
      const authorMatch =
        !author.trim() ||
        (book.author?.toLowerCase().includes(author.toLowerCase()) ?? false);
      const titleMatch =
        !title.trim() || book.title.toLowerCase().includes(title.toLowerCase());
      return isbnMatch && authorMatch && titleMatch;
    });
  }, [isbn, author, title, allBooks]);

  const pageCount = results ? Math.ceil(results.length / PAGE_SIZE) : 0;
  const pagedResults = results
    ? results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : results;

  return (
    <>
      <Head>
        <title>Staff - Transactions - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {isCheckin ? "Check In" : isCheckout ? "Check Out" : "Transactions"}
          </Typography>
          {(isCheckin || isCheckout) && (
            <IconButton
              size="small"
              title={isCheckin ? "Switch to Check Out" : "Switch to Check In"}
              onClick={() =>
                router.replace(
                  `${PAGES.STAFF.TRANSACTIONS.HOME}?type=${isCheckin ? "checkout" : "checkin"}`,
                )
              }
            >
              <SyncAltIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            Choose Book
          </Typography>

          {booksLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading book library...
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Title"
                  size="small"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setPage(1);
                  }}
                />
                <TextField
                  label="Author"
                  size="small"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    setPage(1);
                  }}
                />
                <TextField
                  label="ISBN"
                  size="small"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    setPage(1);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <BarcodeScannerButton
                  onScan={(text) => {
                    setIsbn(text);
                    setPage(1);
                    const match = allBooks.find(
                      (b) => b.isbn?.toLowerCase() === text.toLowerCase(),
                    );
                    if (match) {
                      router.push(
                        `${PAGES.STAFF.TRANSACTIONS.BOOK}/${match.book_id}${type ? `?type=${type}` : ""}`,
                      );
                    }
                  }}
                />
              </Box>

              {title === "" && author === "" && isbn === "" ? (
                <Typography variant="body2" color="text.secondary">
                  Enter a search query to start searching for books.
                </Typography>
              ) : null}
              {results !== null &&
                (results.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No books found.
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {pagedResults!.map((book) => (
                      <Paper
                        key={book.book_id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 60,
                              position: "relative",
                              flexShrink: 0,
                              borderRadius: 0.5,
                              overflow: "hidden",
                              backgroundColor: (theme) =>
                                theme.palette.mode === "light"
                                  ? theme.palette.grey[200]
                                  : theme.palette.grey[900],
                            }}
                          >
                            {book.cover_id && <Cover coverId={book.cover_id} />}
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {book.title}
                            </Typography>
                            {book.author && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {book.author}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: "center", minWidth: 80 }}>
                            {isCheckin ? (
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                {book.count}{" "}
                                {book.count === 1 ? "copy" : "copies"},{" "}
                                <span
                                  style={{
                                    color:
                                      book.count -
                                        book.availableCount -
                                        book.heldCount >
                                      0
                                        ? "green"
                                        : undefined,
                                  }}
                                >
                                  {book.count -
                                    book.availableCount -
                                    book.heldCount}{" "}
                                  checked out
                                </span>
                                {book.heldCount > 0 && (
                                  <>
                                    ,{" "}
                                    <span
                                      style={{
                                        color:
                                          theme.palette.customYellow
                                            .contrastText,
                                      }}
                                    >
                                      {book.heldCount} on hold
                                    </span>
                                  </>
                                )}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                <span
                                  style={{
                                    color:
                                      book.availableCount > 0
                                        ? "green"
                                        : undefined,
                                  }}
                                >
                                  {book.availableCount} available
                                </span>
                                {book.heldCount > 0 && (
                                  <>
                                    ,{" "}
                                    <span
                                      style={{
                                        color:
                                          theme.palette.customYellow
                                            .contrastText,
                                      }}
                                    >
                                      {book.heldCount} on hold
                                    </span>
                                  </>
                                )}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={
                            isCheckin
                              ? book.count -
                                  book.availableCount -
                                  book.heldCount ===
                                0
                              : book.availableCount + book.heldCount === 0
                          }
                          onClick={() =>
                            router.push(
                              `${PAGES.STAFF.TRANSACTIONS.BOOK}/${book.book_id}${type ? `?type=${type}` : ""}`,
                            )
                          }
                        >
                          Select Book
                        </Button>
                      </Paper>
                    ))}
                    {pageCount > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          pt: 2,
                        }}
                      >
                        <Pagination
                          count={pageCount}
                          page={page}
                          onChange={(_, value) => setPage(value)}
                          color="primary"
                        />
                      </Box>
                    )}
                  </Box>
                ))}
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
