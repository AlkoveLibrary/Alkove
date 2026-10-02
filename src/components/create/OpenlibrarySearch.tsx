import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BarcodeScannerButton from "components/BarcodeScannerButton";
import SearchResultsList from "components/create/OpenLibrarySearchList";
import { OpenLibraryWork, OpenLibraryEdition } from "types/openlibrary";

interface SearchResults {
  work: OpenLibraryWork | null;
  edition: OpenLibraryEdition | null;
}

type OpenlibrarySearchProps = {
  onSelectBook: (edition: OpenLibraryEdition) => void;
  isbn: string;
  setIsbn: (isbn: string) => void;
  searchResults: SearchResults | null;
  setSearchResults: (results: SearchResults | null) => void;
  isSearching: boolean;
  setIsSearching: (b: boolean) => void;
  onSearch: (searchQuery?: string) => void;
  searchError?: string | null;
  onAddManually?: () => void;
  scannerOpen?: boolean;
  onScannerOpenChange?: (open: boolean) => void;
};

export default function OpenlibrarySearch({
  onSelectBook,
  isbn,
  setIsbn,
  searchResults,
  isSearching,
  onSearch,
  searchError,
  onAddManually,
  scannerOpen,
  onScannerOpenChange,
}: OpenlibrarySearchProps) {
  const handleScan = (text: string) => {
    setIsbn(text);
    onSearch(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleSelectEdition = (edition: OpenLibraryEdition) => {
    onSelectBook(edition);
  };

  return (
    <Box>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Typography>
          Enter or scan an ISBN to search the online database OpenLibrary. If
          found, the available details will be pre-filled in the form.
        </Typography>

        <BarcodeScannerButton
          onScan={handleScan}
          sx={{ width: "100%" }}
          open={scannerOpen}
          onOpenChange={onScannerOpenChange}
        />

        <Grid size={12}>
          <TextField
            label="ISBN"
            variant="outlined"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => onSearch()}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </Grid>
      </Grid>
      {isSearching ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 120,
          }}
        >
          <CircularProgress />
        </Box>
      ) : searchError ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            minHeight: 120,
          }}
        >
          <Alert severity="error">{searchError}</Alert>
          {onAddManually && (
            <Button variant="outlined" onClick={onAddManually}>
              Would you like to add manually?
            </Button>
          )}
        </Box>
      ) : (
        searchResults &&
        searchResults.edition && (
          <>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {searchResults.work && (
                <>
                  <Typography variant="h6" align="center">
                    {searchResults.work.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                  >
                    {searchResults.work.author.join(", ")}
                    {searchResults.work.publication_year
                      ? ` (${searchResults.work.publication_year})`
                      : ""}
                  </Typography>
                  {searchResults.work.description && (
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" color="text.secondary">
                          Book Description
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {searchResults.work.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {searchResults.edition?.description && (
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" color="text.secondary">
                          Edition Description
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {searchResults.edition.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </>
              )}
            </Box>
            <SearchResultsList
              edition={searchResults.edition}
              onSelectEdition={handleSelectEdition}
            />
          </>
        )
      )}
    </Box>
  );
}
