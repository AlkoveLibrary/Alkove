import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import useSWR from "swr";
import { formatDate } from "util/format-date";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

interface ErrorLog {
  error_log_id: string;
  ip_address: string;
  url: string;
  method: string;
  user_agent: string;
  error: string;
  error_dump: string;
  created_at: string;
  type: string;
}

const columns: GridColDef[] = [
  { field: "friendly_date", headerName: "Date (Friendly)", width: 160 },
  { field: "created_at", headerName: "Timestamp", width: 180 },
  { field: "type", headerName: "Source", width: 110 },
  { field: "error", headerName: "Error", width: 200 },
  { field: "url", headerName: "URL", width: 200 },
  { field: "method", headerName: "Method", width: 100 },
  { field: "ip_address", headerName: "IP Address", width: 140 },
  { field: "user_agent", headerName: "User Agent", width: 200 },
  { field: "error_dump", headerName: "Dump", width: 300 },
];

export default function ErrorLogsPage() {
  const { data: logs, isLoading } = useSWR<ErrorLog[]>("admin/logs/error");

  return (
    <>
      <Head>
        <title>Error Logs - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Error Logs
        </Typography>

        <DataGrid
          autoHeight
          rows={logs?.map((l) => ({
            ...l,
            id: l.error_log_id,
            friendly_date: formatDate(l.created_at),
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
