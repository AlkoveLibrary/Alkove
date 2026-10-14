import {
  Box,
  Button,
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
import BarcodeScannerButton from "components/BarcodeScannerButton";
import { BookWithCount } from "types/book";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BooksPage() {
  const router = useRouter();
  const { data } = useSWR<{ books: BookWithCount[] }>("staff/books");

  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterIsbn, setFilterIsbn] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const rows = (data?.books ?? []).filter((b) => {
    const t = filterTitle.trim().toLowerCase();
    const a = filterAuthor.trim().toLowerCase();
    const i = filterIsbn.trim().toLowerCase();
    const y = filterYear.trim();
    if (t && !b.title.toLowerCase().includes(t)) return false;
    if (a && !(b.author ?? "").toLowerCase().includes(a)) return false;
    if (i && !(b.isbn ?? "").toLowerCase().includes(i)) return false;
    if (y && !String(b.edition_year ?? b.publication_year ?? "").startsWith(y))
      return false;
    return true;
  });

  const columns: GridColDef<BookWithCount>[] = [
    { field: "title", headerName: "Title", flex: 2, minWidth: 180 },
    {
      field: "author",
      headerName: "Author",
      flex: 1.5,
      minWidth: 140,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "isbn",
      headerName: "ISBN",
      flex: 1,
      minWidth: 130,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "edition_year",
      headerName: "Year",
      type: "number",
      width: 80,
      valueGetter: (_value, row) =>
        row.edition_year ?? row.publication_year ?? null,
      valueFormatter: (value) => value ?? "-",
    },
    {
      field: "count",
      headerName: "Copies",
      width: 90,
      align: "right",
      headerAlign: "right",
      valueGetter: (value) => value,
    },
    {
      field: "availableCount",
      headerName: "Available",
      width: 90,
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
        <title>Staff - Book Catalog - {LIBRARY_NAME}</title>
      </Head>
      <Box>
        <Box sx={{ p: 3 }}>
          <IconButton
            onClick={() => router.push(PAGES.STAFF.HOME)}
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
            <Button
              variant="contained"
              onClick={() => router.push(PAGES.STAFF.BOOKS.CREATE)}
            >
              + Create Book
            </Button>
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
            {filterField("ISBN", filterIsbn, setFilterIsbn)}
            {filterField("Year", filterYear, setFilterYear)}
            <BarcodeScannerButton
              onScan={(text) => {
                setFilterIsbn(text);
                const match = (data?.books ?? []).find(
                  (b) => b.isbn?.toLowerCase() === text.toLowerCase(),
                );
                if (match) {
                  router.push(
                    PAGES.STAFF.BOOKS.BOOK.HOME.replace(
                      "[book_id]",
                      match.book_id,
                    ),
                  );
                }
              }}
            />
          </Box>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.book_id}
            onRowClick={(params: GridRowParams<BookWithCount>) =>
              router.push(
                PAGES.STAFF.BOOKS.BOOK.HOME.replace(
                  "[book_id]",
                  params.row.book_id,
                ),
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
