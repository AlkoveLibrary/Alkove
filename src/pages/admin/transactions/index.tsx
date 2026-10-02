import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Transaction } from "@prisma/client";
import useSWR from "swr";
import { formatDate } from "util/format-date";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

const columns: GridColDef[] = [
  { field: "friendly_date", headerName: "Created At", flex: 1, minWidth: 160 },
  {
    field: "transaction_id",
    headerName: "Transaction ID",
    flex: 1,
    minWidth: 180,
  },
  { field: "user_id", headerName: "User ID", flex: 1, minWidth: 180 },
  { field: "copy_id", headerName: "Copy ID", flex: 1, minWidth: 140 },
  { field: "checked_in_at", headerName: "Checked In", flex: 1, minWidth: 160 },
  {
    field: "checked_out_at",
    headerName: "Checked Out",
    flex: 1,
    minWidth: 160,
  },
  { field: "held_at", headerName: "Held On", flex: 1, minWidth: 160 },
  {
    field: "hold_cancelled_at",
    headerName: "Hold Cancelled On",
    flex: 1,
    minWidth: 160,
  },
];

export default function TransactionsPage() {
  const { data, isLoading } = useSWR<{ transactions: Transaction[] }>(
    "admin/transactions",
  );

  return (
    <>
      <Head>
        <title>Admin - Transactions - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>

        <DataGrid
          autoHeight
          rows={data?.transactions?.map((l) => ({
            ...l,
            id: l.transaction_id,
            friendly_date: formatDate(l.created_at),
            checked_in_at: l.checked_in_at ? formatDate(l.checked_in_at) : null,
            checked_out_at: l.checked_out_at
              ? formatDate(l.checked_out_at)
              : null,
            held_at: l.held_at ? formatDate(l.held_at) : null,
            hold_cancelled_at: l.hold_cancelled_at
              ? formatDate(l.hold_cancelled_at)
              : null,
          }))}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
