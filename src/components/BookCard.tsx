import {
  Card,
  CardActionArea,
  Box,
  Typography,
  CardContent,
  Chip,
} from "@mui/material";
import { Book } from "@prisma/client";
import { PAGES } from "constants/pages";
import Image from "next/image";
import router from "next/router";
import { FC } from "react";
import { Cover } from "./Cover";

export const BookCard: FC<{
  book: Book;
  checkedOut?: string;
  onHold?: string;
}> = ({ book, checkedOut, onHold }) => {
  return (
    <Card
      sx={{
        height: "400px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <CardActionArea
        onClick={() =>
          router.push(PAGES.OPAC.BOOK.replace("[book_id]", book.book_id))
        }
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {book.cover_id ? (
          <Box sx={{ width: "100%", height: 300, position: "relative" }}>
            <Cover coverId={book.cover_id} />
          </Box>
        ) : (
          <Box
            sx={{
              height: 200,
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[200]
                  : theme.palette.grey[900],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/book.svg"
              alt="No cover available"
              width={132}
              height={122}
              style={{ width: 96, height: "auto", opacity: 0.6 }}
            />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
            {book.title}
          </Typography>
          {book.author && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {book.author}
            </Typography>
          )}
          {checkedOut && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Chip label={`Checked out: ${checkedOut}`} size="small" />
            </Box>
          )}
          {onHold && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Chip
                label={`On Hold: ${onHold}`}
                size="small"
                sx={{
                  backgroundColor: (theme) => theme.palette.customYellow.main,
                  color: (theme) => theme.palette.customYellow.contrastText,
                }}
              />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
      {book.publication_year && !checkedOut && !onHold && (
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <Chip label={book.publication_year} size="small" color="default" />
        </Box>
      )}
    </Card>
  );
};
