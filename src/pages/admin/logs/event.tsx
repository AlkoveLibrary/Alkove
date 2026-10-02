import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import useSWR from "swr";
import { formatDate } from "util/format-date";
import { EventLog } from "@prisma/client";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

const columns: GridColDef[] = [
  { field: "friendly_date", headerName: "Date (Friendly)", width: 185 },
  { field: "event", headerName: "Event", width: 200 },
  { field: "type", headerName: "Type", width: 75 },
  { field: "action", headerName: "Action", width: 75 },
  { field: "ip_address", headerName: "IP Address", width: 150 },
  { field: "user_agent", headerName: "User Agent", width: 300 },

  {
    field: "data",
    headerName: "Data",
    width: 300,
    renderCell: (params) => {
      const data = params.value;
      if (!data) return "";
      return JSON.stringify(data);
    },
  },
  { field: "user_id", headerName: "User ID", width: 200 },
];

export default function EventLogsPage() {
  const { data: logs, isLoading } = useSWR<{ logs: EventLog[] }>(
    "admin/logs/event",
  );

  return (
    <>
      <Head>
        <title>Event Logs - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Event Logs
        </Typography>

        <DataGrid
          autoHeight
          rows={
            logs?.logs.map((l) => {
              return {
                ...l,
                id: l.event_log_id,
                friendly_date: formatDate(l.created_at),
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
