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
import { BookWithCount, BookWithCover } from "types/book";
import { formatDate } from "util/format-date";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

type BookTableRow = BookWithCover & { id: string };

export default function BooksPage() {
  const router = useRouter();
  const { data } = useSWR<{ books: BookWithCover[] }>("admin/books");

  const [filterTitle, setFilterTitle] = useState("");
  const [filterIsbn, setFilterIsbn] = useState("");

  const rows: BookTableRow[] = (data?.books ?? [])
    .filter((b) => {
      const t = filterTitle.trim().toLowerCase();
      const i = filterIsbn.trim().toLowerCase();
      if (t && !b.title.toLowerCase().includes(t)) return false;
      if (i && !(b.isbn ?? "").toLowerCase().includes(i)) return false;
      return true;
    })
    .map((b) => ({ ...b, id: b.book_id }));

  const columns: GridColDef<BookTableRow>[] = [
    { field: "title", headerName: "Title", flex: 2, minWidth: 180 },
    {
      field: "isbn",
      headerName: "ISBN",
      minWidth: 150,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "book_created_at",
      headerName: "Book Created",
      minWidth: 190,
      valueGetter: (_value, row) => row.created_at ?? null,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: "cover_path",
      headerName: "cover_path",
      flex: 1.5,
      minWidth: 180,
      valueGetter: (_value, row) => row.cover?.file_path ?? "-",
    },
    {
      field: "cover_location",
      headerName: "Location",
      minWidth: 120,
      valueGetter: (_value, row) => {
        if (!row.cover) return "-";
        return row.cover.openlibrary_cover_id ? "openlibrary" : "upload";
      },
    },
    {
      field: "cover_created_at",
      headerName: "Cover Created",
      minWidth: 190,
      valueGetter: (_value, row) => row.cover?.created_at ?? null,
      valueFormatter: (value) => formatDate(value),
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
        <title>Admin - Book Catalog - {LIBRARY_NAME}</title>
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(PAGES.ADMIN.BOOKS.COVERS)}
              >
                Bulk Upload Covers
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(PAGES.STAFF.BOOKS.CREATE)}
              >
                + Create Book
              </Button>
            </Box>
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
            {filterField("ISBN", filterIsbn, setFilterIsbn)}
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
