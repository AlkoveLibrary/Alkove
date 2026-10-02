import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { PAGES } from "constants/pages";
import { BookWithCount, BookWithCountOpac } from "types/book";
import { useMobileBreakpoint } from "hooks/useMobileBreakpoint";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BooksPage() {
  const router = useRouter();
  const { data } = useSWR<{ books: BookWithCountOpac[] }>("opac/books");

  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const rows = (data?.books ?? []).filter((b) => {
    const t = filterTitle.trim().toLowerCase();
    const a = filterAuthor.trim().toLowerCase();
    const y = filterYear.trim();
    if (t && !b.title.toLowerCase().includes(t)) return false;
    if (a && !(b.author ?? "").toLowerCase().includes(a)) return false;
    if (y && !String(b.edition_year ?? "").startsWith(y)) return false;
    return true;
  });
  const isMobile = useMobileBreakpoint();

  const columns: GridColDef<BookWithCountOpac>[] = [
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "author",
      headerName: "Author",
      flex: 1,

      valueGetter: (value) => value ?? "-",
    },
    {
      field: "edition_year",
      headerName: "Year",
      flex: 0.5,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "genre",
      headerName: "Genre",
      flex: 0.75,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "count",
      headerName: "Copies",
      flex: 0.5,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => value,
    },
    {
      field: "availableCount",
      headerName: "Available",
      flex: 0.5,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => value,
    },
  ];

  const filterField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <TextField
      label={label}
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: 140 }}
    />
  );

  return (
    <>
      <Head>
        <title>Book Catalog - {LIBRARY_NAME}</title>
      </Head>
      <Box>
        <Box sx={{ p: isMobile ? 1 : 3 }}>
          <IconButton
            onClick={() => router.push(PAGES.OPAC.HOME)}
            sx={{ mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Book Catalog
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 2,
              alignItems: "center",
            }}
          >
            {filterField("Title", filterTitle, setFilterTitle)}
            {filterField("Author", filterAuthor, setFilterAuthor)}
            {!isMobile && filterField("Year", filterYear, setFilterYear)}
          </Box>
          <DataGrid
            rows={rows}
            columns={isMobile ? columns.splice(0, 2) : columns}
            getRowId={(row) => row.book_id}
            onRowClick={(params: GridRowParams<BookWithCount>) =>
              router.push(
                PAGES.OPAC.BOOK.replace("[book_id]", params.row.book_id),
              )
            }
            sx={{ cursor: "pointer" }}
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>
    </>
  );
}
