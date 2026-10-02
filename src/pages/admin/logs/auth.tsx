import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import useSWR from "swr";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

interface AuthLog {
  id: string;
  created: string;
  status: number | string;
  ip: string;
  user: string;
  method: string;
  url: string;
  userAgent: string;
  referer: string;
  execTime: number | string;
  message: string;
  level: number | string;
}

type PBLog = {
  id: string;
  created: string;
  message: string;
  level: number;
  data?: {
    status?: number;
    userIP?: string;
    remoteIP?: string;
    auth?: string;
    method?: string;
    url?: string;
    userAgent?: string;
    referer?: string;
    execTime?: number;
  };
};

export default function AuthLogsPage() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState("");
  const [filterInput, setFilterInput] = useState("");

  const { data, isLoading } = useSWR<{
    items?: PBLog[];
    totalItems?: number;
  }>(
    `admin/logs/auth?page=${paginationModel.page + 1}&perPage=${paginationModel.pageSize}&filter=${encodeURIComponent(filter)}`,
  );

  // Map PocketBase log structure to flat rows for DataGrid
  const logs: AuthLog[] = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        id: item.id,
        created: item.created,
        status: item.data?.status ?? "",
        ip: item.data?.userIP || item.data?.remoteIP || "",
        user: item.data?.auth || "",
        method: item.data?.method || "",
        url: item.data?.url || "",
        userAgent: item.data?.userAgent || "",
        referer: item.data?.referer || "",
        execTime: item.data?.execTime ?? "",
        message: item.message || "",
        level: item.level ?? "",
      })),
    [data],
  );

  const rowCount = data?.totalItems || 0;

  const columns: GridColDef[] = [
    { field: "created", headerName: "Date", width: 180 },
    { field: "status", headerName: "Status", width: 80 },
    { field: "level", headerName: "Level", width: 70 },
    { field: "ip", headerName: "IP", width: 140 },
    { field: "user", headerName: "User", width: 120 },
    { field: "method", headerName: "Method", width: 80 },
    { field: "url", headerName: "URL", width: 220 },
    { field: "referer", headerName: "Referer", width: 180 },
    { field: "userAgent", headerName: "User Agent", width: 180 },
    { field: "execTime", headerName: "Exec Time", width: 90 },
    { field: "message", headerName: "Message", width: 220 },
  ];

  return (
    <>
      <Head>
        <title>Auth Logs - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Auth Logs
        </Typography>
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <TextField
            label="Filter"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={() => setFilter(filterInput)}>
            Apply
          </Button>
        </Box>
        <DataGrid
          autoHeight
          rows={logs.map((l) => ({ ...l, id: l.id }))}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
