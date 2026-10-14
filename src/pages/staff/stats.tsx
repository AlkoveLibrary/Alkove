import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";
import { PAGES } from "constants/pages";
import { CHART_COLORS } from "constants/colors";
import useSWR from "swr";
import {
  BooksPerInterval,
  BooksByGenre,
  BooksCheckedOutBreakdown,
  TransactionsByGenre,
  TransactionsByAuthor,
  TransactionsPerWeek,
  BooksByAuthor,
} from "types/book";
import BooksPerYearChart from "components/chart/BooksPerYearChart";
import BooksByGenreChart from "components/chart/BooksByGenreChart";
import BooksCheckedOutChart from "components/chart/BooksCheckedOutChart";
import TransactionsByGenreChart from "components/chart/TransactionsByGenreChart";
import TransactionsByAuthorChart from "components/chart/TransactionsByAuthorChart";
import TransactionsByWeekChart from "components/chart/TransactionsByWeekChart";
import BooksByAuthorChart from "components/chart/BooksByAuthorChart";

export default function Stats() {
  const router = useRouter();

  const { data, error, isLoading } = useSWR<{
    booksPerInterval: BooksPerInterval;
    booksWithYearCount: number;
    booksByGenre: BooksByGenre;
    booksCheckedOutBreakdown: BooksCheckedOutBreakdown;
    transactionsByGenre: TransactionsByGenre;
    transactionsByAuthor: TransactionsByAuthor;
    transactionsPerWeek: TransactionsPerWeek;
    booksByAuthor: BooksByAuthor;
  }>("staff/stats");

  const genreColors = new Map<string, string>();
  (data?.booksByGenre ?? [])
    .map((entry) => entry.genre)
    .sort()
    .forEach((genre, index) => {
      genreColors.set(genre, CHART_COLORS[index % CHART_COLORS.length]);
    });

  const authorColors = new Map<string, string>();
  const allAuthorNames = new Set<string>();
  (data?.booksByAuthor ?? []).forEach((entry) => {
    if (entry.author !== "Other") allAuthorNames.add(entry.author);
  });
  (data?.transactionsByAuthor ?? []).forEach((entry) => {
    if (entry.author !== "Other") allAuthorNames.add(entry.author);
  });
  Array.from(allAuthorNames)
    .sort()
    .forEach((author, index) => {
      authorColors.set(author, CHART_COLORS[index % CHART_COLORS.length]);
    });

  return (
    <>
      <Head>
        <title>Stats - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 4 }}>
        <IconButton
          onClick={() => router.push(PAGES.STAFF.HOME)}
          sx={{ mb: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
          Library Stats
        </Typography>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Failed to load stats.</Typography>
        ) : data ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <BooksPerYearChart
              data={data.booksPerInterval}
              booksWithYearCount={data.booksWithYearCount}
            />
            <BooksByGenreChart
              data={data.booksByGenre}
              genreColors={genreColors}
            />
            <TransactionsByGenreChart
              data={data.transactionsByGenre}
              genreColors={genreColors}
            />
            <BooksCheckedOutChart data={data.booksCheckedOutBreakdown} />
            <TransactionsByWeekChart data={data.transactionsPerWeek} />
            <BooksByAuthorChart
              data={data.booksByAuthor}
              authorColors={authorColors}
            />
            <TransactionsByAuthorChart
              data={data.transactionsByAuthor}
              authorColors={authorColors}
            />
          </Box>
        ) : null}
      </Box>
    </>
  );
}
