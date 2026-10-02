import { Box, Typography } from "@mui/material";
import { BookWithCopies, BookWithCopiesStaff } from "types/book";

function isbnType(isbnToCheck: string) {
  if (isbnToCheck.length === 13) {
    return "-13";
  } else if (isbnToCheck.length === 10) {
    return "-10";
  } else {
    return "";
  }
}

type BookDetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function BookDetailRow({ label, value }: BookDetailRowProps) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return (
    <>
      <Typography
        color="text.secondary"
        align="right"
        sx={{ justifySelf: "end" }}
      >
        {label}
      </Typography>
      <Typography align="left">{value}</Typography>
    </>
  );
}

type BookDetailsTableProps = {
  book: BookWithCopies | BookWithCopiesStaff;
};

export function BookDetailsTable({ book }: BookDetailsTableProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        rowGap: 1,
        columnGap: 2,
      }}
    >
      <BookDetailRow
        label={`ISBN${book.isbn ? isbnType(book.isbn) : ""}`}
        value={book.isbn}
      />
      <BookDetailRow label="Genre" value={book.genre} />
      <BookDetailRow label="Edition" value={book.edition} />
      <BookDetailRow label="Edition Year" value={book.edition_year} />
      <BookDetailRow label="Dewey Decimal" value={book.dewey_decimal} />
      <BookDetailRow label="Page Count" value={book.page_count} />
      <BookDetailRow label="Format" value={book.format} />
      <BookDetailRow label="Publisher" value={book.publisher} />
      <BookDetailRow
        label="First Published"
        value={
          book.publication_year === book.edition_year
            ? null
            : book.publication_year
        }
      />
      <BookDetailRow label="Description" value={book.description} />
    </Box>
  );
}
