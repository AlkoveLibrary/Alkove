import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Book, Copy, Transaction, User } from "@prisma/client";
import { useRouter } from "next/router";
import useSWR from "swr";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

type TransactionFull = Transaction & {
  user: User;
  copy: Copy & { book: Book };
};

const columns: GridColDef[] = [
  { field: "title", headerName: "Title", flex: 1.5, minWidth: 200 },
  { field: "author", headerName: "Author", flex: 1, minWidth: 160 },
  {
    field: "checked_out_at",
    headerName: "Days Out",
    width: 120,
    valueGetter: (value: string) =>
      Math.floor(
        (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24),
      ),
  },
];

export default function BorrowedPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR<{ transactions: TransactionFull[] }>(
    "staff/transactions",
  );

  const rows = (data?.transactions ?? [])
    .filter((t) => t.checked_out_at && !t.checked_in_at)
    .map((t) => ({
      id: t.transaction_id,
      title: t.copy.book.title,
      author: t.copy.book.author ?? "-",
      checked_out_at: t.checked_out_at,
    }));

  return (
    <>
      <Head>
        <title>Staff - Borrowed Books - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Borrowed Books
        </Typography>

        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: "checked_out_at", sort: "desc" }] },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
