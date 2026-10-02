import React, { useState } from "react";
import { Box, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Book } from "@prisma/client";
import { BookCard } from "./BookCard";

interface CarouselProps {
  books: Book[];
}

export const BookCarousel: React.FC<CarouselProps> = ({ books }) => {
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  // Default to 5 for xl and up
  let booksPerPage = 5;
  if (isXs) booksPerPage = 2;
  else if (isSm) booksPerPage = 3;
  else if (isMd) booksPerPage = 4;
  else if (isLg) booksPerPage = 5;

  const pageCount = Math.ceil(books.length / booksPerPage);
  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));
  const start = page * booksPerPage;
  const end = start + booksPerPage;
  const visibleBooks = books.slice(start, end);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <IconButton onClick={handlePrev} disabled={page === 0}>
        <ArrowBackIosNewIcon />
      </IconButton>
      <Grid
        container
        spacing={2}
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 5 }}
        sx={{ width: "100%", maxWidth: 1400 }}
      >
        {visibleBooks.map((book) => (
          <Grid key={book.book_id} size={1}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
      <IconButton onClick={handleNext} disabled={page === pageCount - 1}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};
