import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSnackbar } from "notistack";

import useSWR from "swr";
import { PAGES } from "constants/pages";
import { BookRequestWithUser } from "types/book";
import { formatDate } from "util/format-date";
import { withSnackbar } from "util/snackbar-request";
import { archiveBookRequestRequest } from "requests/book";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function BooksPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data, mutate } = useSWR<{ book_requests: BookRequestWithUser[] }>(
    "staff/book-requests",
  );

  const [confirmRequest, setConfirmRequest] =
    useState<BookRequestWithUser | null>(null);
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    if (!confirmRequest) return;
    setArchiving(true);
    await withSnackbar(
      () => archiveBookRequestRequest(confirmRequest.book_request_id),
      "Book request archived",
      "Failed to archive book request",
      enqueueSnackbar,
    );
    await mutate();
    setArchiving(false);
    setConfirmRequest(null);
  };
  const columns: GridColDef<BookRequestWithUser>[] = [
    { field: "title", headerName: "Title", flex: 2, minWidth: 100 },
    {
      field: "author",
      headerName: "Author",
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 2,
      minWidth: 200,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "created_at",
      headerName: "Requested On",
      flex: 1,
      minWidth: 160,
      valueGetter: (value) => formatDate(value, true),
    },
    {
      field: "user",
      headerName: "Requested By",
      flex: 1.5,
      minWidth: 160,
      valueGetter: (value: { first_name: string; last_name: string }) =>
        `${value.first_name} ${value.last_name}`,
    },
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
            setConfirmRequest(params.row);
          }}
        >
          Archive
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Book Requests - {LIBRARY_NAME}</title>
      </Head>
      <Box>
        <Box sx={{ p: 3 }}>
          <Dialog
            open={Boolean(confirmRequest)}
            onClose={() => setConfirmRequest(null)}
          >
            <DialogTitle>Confirm Book Request Archive</DialogTitle>
            <Box sx={{ p: 3, pt: 0 }}>
              <Typography gutterBottom>
                Are you sure you want to archive the request for{" "}
                <strong>{confirmRequest?.title}</strong>?
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
                  onClick={() => setConfirmRequest(null)}
                  disabled={archiving}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleArchive}
                  disabled={archiving}
                >
                  Confirm
                </Button>
              </Box>
            </Box>
          </Dialog>
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
              Book Requests
            </Typography>
          </Box>

          <DataGrid
            rows={data?.book_requests ?? []}
            columns={columns}
            getRowId={(row) => row.book_request_id}
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
