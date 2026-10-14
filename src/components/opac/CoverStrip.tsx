import { Box } from "@mui/material";
import { Book } from "@prisma/client";
import { Cover } from "components/Cover";
import { scroll } from "components/opac/styles";
import React from "react";

export const CoverStrip: React.FC<{ books: Book[] }> = ({ books }) => {
  if (books.length === 0) return null;
  const loop = [...books, ...books];

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: (theme) => (theme.palette.mode === "dark" ? 0.16 : 0.12),
        maskImage:
          "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
      }}
    >
      <Box
        sx={{
          ...scroll,
          display: "flex",
          gap: 2,
          width: "max-content",
          height: "100%",
          alignItems: "center",
          animation: "scroll 60s linear infinite",
        }}
      >
        {loop.map((book, index) => (
          <Box
            key={`${book.book_id}-${index}`}
            sx={{
              position: "relative",
              width: 150,
              height: 225,
              flexShrink: 0,
              filter: "grayscale(0.3)",
            }}
          >
            <Cover coverId={book.cover_id as string} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
