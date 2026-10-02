import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { CoverSmall } from "./CoverSmall";
import { OpenLibraryEdition } from "types/openlibrary";

interface SearchResultsListProps {
  edition: OpenLibraryEdition;
  onSelectEdition: (edition: OpenLibraryEdition) => void;
}

export default function SearchResultsList({
  edition,
  onSelectEdition,
}: SearchResultsListProps) {
  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <CoverSmall openLibraryId={edition.cover} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {edition.title}
            </Typography>
            {edition.edition && (
              <Typography variant="body2" color="text.secondary">
                Edition: {edition.edition}
              </Typography>
            )}
            {edition.edition_year && (
              <Typography variant="body2" color="text.secondary">
                Edition Year: {edition.edition_year}
              </Typography>
            )}
            {edition.format && (
              <Typography variant="body2" color="text.secondary">
                Format: {edition.format}
              </Typography>
            )}
            {edition.publisher && edition.publisher.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Publisher: {edition.publisher}
              </Typography>
            )}
            {edition.page_count && (
              <Typography variant="body2" color="text.secondary">
                Pages: {edition.page_count}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSelectEdition(edition)}
        >
          Select
        </Button>
      </Paper>
    </>
  );
}
