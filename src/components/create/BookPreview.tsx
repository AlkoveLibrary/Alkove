import React from "react";
import { Button, Paper, Typography } from "@mui/material";
import { CoverFull } from "../CoverFull";
import { OpenLibraryEdition, OpenLibraryWork } from "types/openlibrary";
import { useSnackbar } from "notistack";

interface BookPreviewProps {
  selectedBook: OpenLibraryEdition;
  work?: OpenLibraryWork;
}

export function BookPreview({ selectedBook, work }: BookPreviewProps) {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Paper sx={{ p: 2, sticky: "top" }}>
      <CoverFull openLibraryId={selectedBook.cover} />
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        {selectedBook.title}
      </Typography>
      {typeof work !== "undefined" && work.author && work.author.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Author:</strong> {work.author.join(", ")}
        </Typography>
      )}
      {selectedBook.edition && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Edition:</strong> {selectedBook.edition}
        </Typography>
      )}
      {selectedBook.publication_year && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Edition Published:</strong> {selectedBook.publication_year}
        </Typography>
      )}
      {selectedBook.format && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Format:</strong> {selectedBook.format}
        </Typography>
      )}
      {selectedBook.publisher && selectedBook.publisher.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Publisher:</strong> {selectedBook.publisher}
        </Typography>
      )}
      {selectedBook.page_count && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Pages:</strong> {selectedBook.page_count}
        </Typography>
      )}

      {selectedBook.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Edition Description:</strong> {selectedBook.description}
          <Button
            size="small"
            onClick={() => {
              // @ts-expect-error that's exactly why we check if description exists before rendering this button
              navigator.clipboard.writeText(selectedBook.description);
              enqueueSnackbar("Description copied to clipboard", {
                variant: "success",
              });
            }}
          >
            Copy to clipboard
          </Button>
        </Typography>
      )}
    </Paper>
  );
}
