import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Book, Copy, Transaction, User } from "@prisma/client";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSnackbar } from "notistack";
import { PAGES } from "constants/pages";
import { formatDate } from "util/format-date";
import { withSnackbar } from "util/snackbar-request";
import { staffCancelHoldRequest } from "requests/copy";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

type HoldFull = Transaction & {
  user: User;
  copy: Copy & { book: Book };
};

export default function HoldsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, mutate } = useSWR<{ holds: HoldFull[] }>(
    "staff/holds",
  );

  const [confirmHold, setConfirmHold] = useState<{
    transaction_id: string;
    title: string;
    held_by: string;
  } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelHold = async () => {
    if (!confirmHold) return;
    setCancelling(true);
    await withSnackbar(
      () => staffCancelHoldRequest(confirmHold.transaction_id),
      "Hold cancelled",
      "Failed to cancel hold",
      enqueueSnackbar,
    );
    await mutate();
    setCancelling(false);
    setConfirmHold(null);
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1.5, minWidth: 200 },
    { field: "author", headerName: "Author", flex: 1, minWidth: 160 },
    { field: "held_by", headerName: "Held By", flex: 1.5, minWidth: 200 },
    { field: "held_at", headerName: "Held On", flex: 1, minWidth: 160 },
    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={(event) => {
            event.stopPropagation();
            setConfirmHold({
              transaction_id: params.row.id,
              title: params.row.title,
              held_by: params.row.held_by,
            });
          }}
        >
          Cancel
        </Button>
      ),
    },
  ];

  const rows = (data?.holds ?? []).map((hold) => ({
    id: hold.transaction_id,
    book_id: hold.copy.book.book_id,
    title: hold.copy.book.title,
    author: hold.copy.book.author ?? "-",
    held_by: `${hold.user.first_name} ${hold.user.last_name}`,
    held_at: formatDate(hold.held_at),
  }));

  return (
    <>
      <Head>
        <title>Staff - Active Holds - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <Dialog
          open={Boolean(confirmHold)}
          onClose={() => setConfirmHold(null)}
        >
          <DialogTitle>Confirm Hold Cancellation</DialogTitle>
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography gutterBottom>
              Are you sure you want to cancel the hold on{" "}
              <strong>{confirmHold?.title}</strong> for{" "}
              <strong>{confirmHold?.held_by}</strong>?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                onClick={() => setConfirmHold(null)}
                disabled={cancelling}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancelHold}
                disabled={cancelling}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Dialog>
        <IconButton onClick={() => router.push(PAGES.STAFF.HOME)} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Active Holds
        </Typography>

        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          loading={isLoading}
          onRowClick={(params) =>
            router.push(
              `${PAGES.STAFF.TRANSACTIONS.BOOK}/${params.row.book_id}?type=checkout`,
            )
          }
          sx={{ cursor: "pointer" }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
