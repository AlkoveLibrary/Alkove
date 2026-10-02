import {
  Box,
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { PAGES } from "constants/pages";

import { search } from "requests/openlibrary";
import { OpenLibraryWork, OpenLibraryEdition } from "types/openlibrary";
import { FormikHelpers } from "formik";
import { createBookRequest } from "requests/book";
import { BookFormValues } from "types/book";
import OpenlibrarySearch from "components/create/OpenlibrarySearch";
import CreateBookForm from "components/create/CreateBookForm";
import { BookPreview } from "components/create/BookPreview";
import { validateIsbn } from "util/validate-isbn";
import { enqueueSnackbar } from "notistack";
import { scrollToTop } from "util/scroll-to-top";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function CreateBook() {
  const router = useRouter();
  const { isbn: isbnParam } = router.query as { isbn?: string };
  const [tab, setTab] = useState(0);
  const [selectedEdition, setSelectedEdition] =
    useState<OpenLibraryEdition | null>(null);

  // Split state
  const [isbn, setIsbn] = useState(isbnParam ?? "");
  const [searchResults, setSearchResults] = useState<{
    work: OpenLibraryWork | null;
    edition: OpenLibraryEdition | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isbnNotFound, setIsbnNotFound] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleSelectEdition = (edition: OpenLibraryEdition) => {
    setSelectedEdition(edition);
  };

  const handleBackToSearch = () => {
    setSelectedEdition(null);
  };

  const handleAddManually = () => {
    setTab(1);
  };

  const handleClearSearch = () => {
    setIsbn("");
    setSearchResults(null);
    setIsSearching(false);
    setSelectedEdition(null);
    setSearchError(null);
    setIsbnNotFound(false);
  };

  // This allows searching from barcode read, before the state is set
  const handleSearch = async (searchQuery?: string) => {
    const searchValue = searchQuery ?? isbn;
    const { valid, error } = validateIsbn(searchValue, Boolean(searchQuery));
    if (!valid) {
      setSearchError(error);
      setSearchResults(null);
      setIsSearching(false);
      setIsbnNotFound(false);
      return;
    }
    setIsSearching(true);
    setSearchResults(null); // Clear results when starting search
    setSearchError(null);
    setIsbnNotFound(false);
    try {
      const results = await search({ isbn: searchValue });
      setSearchResults(results);
    } catch (err) {
      const error = err as { message?: string; response?: { status?: number } };
      if (
        error?.message === "Edition not found" ||
        error?.response?.status === 404
      ) {
        setSearchError("No results found for this ISBN.");
        setIsbnNotFound(true);
      } else if (typeof error === "string") {
        setSearchError(error);
      } else {
        setSearchError("An error occurred while searching.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (
    values: BookFormValues,
    { setSubmitting, resetForm }: FormikHelpers<BookFormValues>,
    scanAgain?: boolean,
  ) => {
    try {
      const { no_isbn, ...bookValues } = values;
      const nulledValues = {
        ...bookValues,
        isbn: no_isbn ? undefined : bookValues.isbn,
        cover_id: values.cover_id || undefined,
      };

      await createBookRequest(nulledValues);
      enqueueSnackbar("Book created successfully", { variant: "success" });
      resetForm();
      if (scanAgain) {
        handleClearSearch();
        setTab(0);
        setScannerOpen(true);
      } else if (tab === 0) {
        handleClearSearch();
      } else {
        scrollToTop();
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create book";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const work = searchResults?.work;

  return (
    <>
      <Head>
        <title>Add Book - {LIBRARY_NAME}</title>
      </Head>
      <Box>
        <Box sx={{ p: 3, maxWidth: selectedEdition ? 1200 : 800, mx: "auto" }}>
          {tab === 0 &&
          selectedEdition &&
          searchResults &&
          searchResults.work ? (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToSearch}
                sx={{ mr: 1 }}
              >
                Back to Search
              </Button>
            </Box>
          ) : (
            <IconButton
              onClick={() => router.push(PAGES.STAFF.BOOKS.HOME)}
              sx={{ mb: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Add Book
          </Typography>
          {!selectedEdition && (
            <Tabs
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                handleClearSearch();
              }}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab label="Automatic" />
              <Tab label="Manual" />
            </Tabs>
          )}
          {tab === 0 &&
            (selectedEdition && searchResults && searchResults.work ? (
              <Box>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <BookPreview
                      selectedBook={selectedEdition}
                      work={searchResults.work}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <CreateBookForm
                      initialValues={{
                        title: selectedEdition.title,
                        author: work?.author?.length
                          ? work.author.join(", ")
                          : "",
                        isbn: selectedEdition.isbn,
                        publication_year: selectedEdition.publication_year,
                        format: selectedEdition.format ?? "",
                        publisher: selectedEdition.publisher,
                        page_count: selectedEdition.page_count,
                        edition: selectedEdition.edition ?? "",
                        dewey_decimal: "",
                        edition_year: selectedEdition.edition_year,
                        cover_id: undefined,
                        description:
                          work?.description ||
                          selectedEdition.description ||
                          "",
                        genre: "",
                        copies: [{ location: "", condition: "", notes: "" }],
                      }}
                      handleSubmit={handleSubmit}
                      openLibraryCoverId={selectedEdition.cover}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <OpenlibrarySearch
                onSelectBook={handleSelectEdition}
                isbn={isbn}
                setIsbn={setIsbn}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                onSearch={handleSearch}
                searchError={searchError}
                onAddManually={isbnNotFound ? handleAddManually : undefined}
                scannerOpen={scannerOpen}
                onScannerOpenChange={setScannerOpen}
              />
            ))}
          {tab === 1 && (
            <Box>
              <CreateBookForm
                initialValues={{
                  title: "",
                  author: "",
                  isbn: isbn,
                  publication_year: undefined,
                  format: "",
                  publisher: "",
                  page_count: undefined,
                  edition: "",
                  dewey_decimal: "",
                  edition_year: undefined,
                  cover_id: undefined,
                  genre: "",
                  copies: [{ location: "", condition: "", notes: "" }],
                }}
                handleSubmit={handleSubmit}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
