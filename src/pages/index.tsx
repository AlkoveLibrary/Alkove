import {
  alpha,
  Box,
  Button,
  ClickAwayListener,
  InputBase,
  Pagination,
  Paper,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BookCarousel } from "components/BookCarousel";
import { Cover } from "components/Cover";
import { Footer } from "components/Footer";
import { CoverStrip } from "components/opac/CoverStrip";
import { SectionHeading } from "components/opac/SectionHeading";
import { Stat } from "components/opac/Stat";
import { enter, enterFade, enterSlide } from "components/opac/styles";
import {
  LIBRARY_NAME,
  LIBRARY_TAGLINE,
  SHOW_FEATURED_BOOKS,
  SHOW_NEW_ARRIVALS,
  SHOW_POPULAR_BOOKS,
} from "config/config";
import { PAGES } from "constants/pages";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { OpacHomepage } from "types/book";

const SEARCH_PAGE_SIZE = 5;
const STRIP_COVER_COUNT = 14;

export default function HomePage() {
  const { data } = useSWR<OpacHomepage>("opac");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  const books = useMemo(() => data?.books ?? [], [data]);

  const stripBooks = useMemo(() => {
    const ordered = [
      ...(SHOW_NEW_ARRIVALS ? (data?.newArrivals ?? []) : []),
      ...(SHOW_FEATURED_BOOKS ? (data?.featuredBooks ?? []) : []),
      ...(SHOW_POPULAR_BOOKS ? (data?.popularBooks ?? []) : []),
    ];
    const seen = new Set<string>();
    return ordered
      .filter((book) => {
        if (!book.cover_id || seen.has(book.book_id)) return false;
        seen.add(book.book_id);
        return true;
      })
      .slice(0, STRIP_COVER_COUNT);
  }, [data]);

  const authorCount = useMemo(
    () => new Set(books.filter((b) => b.author).map((b) => b.author)).size,
    [books],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        (book.author ?? "").toLowerCase().includes(q),
    );
  }, [books, query]);

  const pageCount = Math.ceil(results.length / SEARCH_PAGE_SIZE);
  const currentPage = Math.min(searchPage, Math.max(pageCount, 1));
  const visibleResults = results.slice(
    (currentPage - 1) * SEARCH_PAGE_SIZE,
    currentPage * SEARCH_PAGE_SIZE,
  );

  const openBook = (bookId: string) =>
    router.push(PAGES.OPAC.BOOK.replace("[book_id]", bookId));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
      }}
    >
      <Head>
        <title>Home - {LIBRARY_NAME}</title>
      </Head>

      <Box
        sx={{
          position: "relative",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#e7dfcf",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 3, md: 8 },
          py: { xs: 8, md: 12 },
        }}
      >
        <CoverStrip books={stripBooks} />

        <Box
          sx={{
            position: "relative",
            maxWidth: 1000,
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              ...enter(0),
              fontSize: { xs: 44, sm: 64, md: 82 },
              lineHeight: 1.05,
            }}
          >
            Welcome to{" "}
            <Box component="span" sx={{ color: "gold.main" }}>
              {LIBRARY_NAME}
            </Box>
          </Typography>
          <Typography
            sx={{
              ...enter(0.1),
              mt: 3,
              color: "text.secondary",
              fontSize: { xs: 16, md: 18 },
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            {LIBRARY_TAGLINE}
          </Typography>

          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box
              sx={{
                ...enterSlide(0.2),
                position: "relative",
                maxWidth: 620,
                mx: "auto",
                mt: 5,
                zIndex: 3,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  ...enterFade(0.2),
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.07)
                      : alpha(theme.palette.background.paper, 0.2),
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.3)
                      : alpha(theme.palette.text.primary, 0.28),
                  backdropFilter: "blur(6px)",
                  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                  "&:focus-within": {
                    borderColor: "gold.main",
                    boxShadow: (theme) =>
                      `0 0 0 3px ${theme.palette.gold.main}33`,
                  },
                }}
              >
                <SearchIcon sx={{ color: "gold.main" }} />
                <InputBase
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchPage(1);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search by title or author..."
                  sx={{ flexGrow: 1, color: "text.primary", fontSize: 16 }}
                  inputProps={{ "aria-label": "Search the catalog" }}
                />
              </Paper>

              {searchOpen && query.trim().length > 0 && (
                <Paper
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    textAlign: "left",
                    overflow: "hidden",
                  }}
                >
                  {results.length === 0 ? (
                    <Box sx={{ px: 2.5, py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No titles match &quot;{query.trim()}&quot;.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {visibleResults.map((book) => (
                        <Box
                          key={book.book_id}
                          onClick={() => openBook(book.book_id)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 2.5,
                            py: 1.5,
                            cursor: "pointer",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            transition: "background-color 0.15s ease",
                            "&:last-of-type": { borderBottom: "none" },
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: 34,
                              height: 50,
                              flexShrink: 0,
                              backgroundColor: "action.hover",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {book.cover_id ? (
                              <Cover coverId={book.cover_id} />
                            ) : (
                              <Image
                                src="/book.svg"
                                alt="No cover available"
                                width={132}
                                height={122}
                                style={{
                                  width: 22,
                                  height: "auto",
                                  opacity: 0.6,
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {book.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {book.author ?? "Unknown author"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {results.length > SEARCH_PAGE_SIZE && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            px: 2.5,
                            py: 1.5,
                            backgroundColor: "action.hover",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {results.length} results
                          </Typography>
                          <Pagination
                            count={pageCount}
                            page={currentPage}
                            onChange={(_, value) => setSearchPage(value)}
                            size="small"
                            siblingCount={0}
                            boundaryCount={1}
                          />
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

          <Box
            sx={{
              ...enter(0.3),
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: 2, md: 3 },
              mt: 7,
            }}
          >
            <Stat value={books.length} label="Titles" />
            <Stat value={authorCount} label="Authors" />
            {SHOW_FEATURED_BOOKS && (
              <Stat value={data?.featuredBooks.length ?? 0} label="Featured" />
            )}
            {SHOW_NEW_ARRIVALS && (
              <Stat
                value={data?.newArrivals.length ?? 0}
                label="New Arrivals"
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: { xs: 2, md: 6 }, pt: 8 }}>
        {SHOW_FEATURED_BOOKS &&
          data?.featuredBooks &&
          data.featuredBooks.length > 0 && (
            <Box sx={{ pb: 10 }}>
              <SectionHeading
                title="Featured Books"
                count={data.featuredBooks.length}
              />
              <BookCarousel books={data.featuredBooks} />
            </Box>
          )}

        {SHOW_NEW_ARRIVALS &&
          data?.newArrivals &&
          data.newArrivals.length > 0 && (
            <Box sx={{ pb: 10 }}>
              <SectionHeading
                title="New Arrivals"
                count={data.newArrivals.length}
              />
              <BookCarousel books={data.newArrivals} />
            </Box>
          )}

        {SHOW_POPULAR_BOOKS &&
          data?.popularBooks &&
          data.popularBooks.length > 0 && (
            <Box sx={{ pb: 10 }}>
              <SectionHeading
                title="Popular Titles"
                count={data.popularBooks.length}
              />
              <BookCarousel books={data.popularBooks} />
            </Box>
          )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            px: 3,
            py: { xs: 3, md: 4 },
          }}
        >
          <Typography variant="h5">Looking for something specific?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
            Browse the full catalog for any title or author.
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push(PAGES.OPAC.BOOKS)}
            sx={{ mt: 1 }}
          >
            Browse Catalog
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
