import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import useSWR from "swr";
import { formatDate } from "util/format-date";
import { MailLog } from "@prisma/client";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

const columns: GridColDef[] = [
  { field: "friendly_date", headerName: "Date (Friendly)", width: 160 },
  { field: "created_at", headerName: "Timestamp", width: 180 },
  { field: "to", headerName: "To", width: 200 },
  { field: "subject", headerName: "Subject", width: 220 },
  { field: "error", headerName: "Error", width: 200 },
  { field: "sent_at", headerName: "Sent At", width: 180 },
  { field: "error_at", headerName: "Error At", width: 180 },
  { field: "time_to_send", headerName: "Time to Send (s)", width: 160 },
  { field: "body", headerName: "Body", width: 300 },
];

export default function MailLogsPage() {
  const { data: logs, isLoading } = useSWR<{ logs: MailLog[] }>(
    "admin/logs/mail",
  );

  return (
    <>
      <Head>
        <title>Mail Logs - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mail Logs
        </Typography>

        <DataGrid
          autoHeight
          rows={
            logs?.logs.map((l) => {
              let time_to_send = null;
              if (l.sent_at && l.created_at) {
                const sent = new Date(l.sent_at).getTime();
                const created = new Date(l.created_at).getTime();
                time_to_send = ((sent - created) / 1000).toFixed(2);
              }
              return {
                ...l,
                id: l.mail_log_id,
                friendly_date: formatDate(l.created_at),
                time_to_send,
              };
            }) ?? []
          }
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
