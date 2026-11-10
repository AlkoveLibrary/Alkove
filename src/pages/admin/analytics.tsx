import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Line } from "react-chartjs-2";
import useSWR from "swr";
import { EventLog } from "@prisma/client";
import "components/chart/register";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

type Log = Pick<
  EventLog,
  "created_at" | "event" | "ip_address" | "user_agent" | "user_id"
>;

type Audience = "all" | "user" | "anon";

const toInputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const RANGES = [
  { label: "Today", from: () => new Date() },
  { label: "Past Day", from: () => daysAgo(1) },
  { label: "Past 7 Days", from: () => daysAgo(7) },
  {
    label: "Month to Date",
    from: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  },
  { label: "Past 30 Days", from: () => daysAgo(30) },
  {
    label: "Year to Date",
    from: () => new Date(new Date().getFullYear(), 0, 1),
  },
  { label: "Past 365 Days", from: () => daysAgo(365) },
  { label: "All", from: () => new Date(2000, 0, 1) },
];

const visitorKey = (log: Log) => log.user_id ?? log.ip_address;

const dayColumns: GridColDef[] = [
  { field: "day", headerName: "Date", width: 130 },
  { field: "visitors", headerName: "Unique Visitors", width: 140 },
  { field: "users", headerName: "Logged In", width: 110 },
  { field: "anon", headerName: "Anonymous", width: 110 },
  { field: "events", headerName: "Events", width: 100 },
];

const eventColumns: GridColDef[] = [
  { field: "event", headerName: "Event", width: 250 },
  { field: "count", headerName: "Count", width: 100 },
  { field: "visitors", headerName: "Unique Visitors", width: 140 },
];

const ipColumns: GridColDef[] = [
  { field: "ip", headerName: "IP Address", width: 160 },
  { field: "events", headerName: "Events", width: 100 },
  { field: "peak", headerName: "Max / Minute", width: 120 },
  { field: "userAgents", headerName: "User Agents", width: 110 },
  { field: "userAgent", headerName: "Last User Agent", width: 400 },
];

export default function AnalyticsPage() {
  const [from, setFrom] = useState(() => toInputDate(daysAgo(7)));
  const [to, setTo] = useState(() => toInputDate(new Date()));
  const [audience, setAudience] = useState<Audience>("all");
  const theme = useTheme();

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  end.setDate(end.getDate() + 1);

  const { data, isValidating, mutate } = useSWR<{ logs: Log[] }>(
    `admin/analytics?from=${start.toISOString()}&to=${end.toISOString()}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
    },
  );

  const logs = (data?.logs ?? []).filter((log) =>
    audience === "all"
      ? true
      : audience === "user"
        ? log.user_id
        : !log.user_id,
  );

  const days = new Map<string, Log[]>();
  const events = new Map<string, Log[]>();
  const ips = new Map<string, Log[]>();
  const add = (map: Map<string, Log[]>, key: string, log: Log) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  };
  for (const log of logs) {
    add(days, toInputDate(new Date(log.created_at)), log);
    add(events, log.event, log);
    add(ips, log.ip_address, log);
  }

  const chartRows: { day: string; events: number }[] = [];
  const firstLog = logs[logs.length - 1];
  const firstDay = firstLog ? new Date(firstLog.created_at) : start;
  const cursor = new Date(`${toInputDate(firstDay)}T00:00:00`);
  while (cursor < end) {
    const day = toInputDate(cursor);
    chartRows.push({ day, events: days.get(day)?.length ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const dayRows = [...days.entries()].map(([day, dayLogs]) => ({
    id: day,
    day,
    visitors: new Set(dayLogs.map(visitorKey)).size,
    users: new Set(dayLogs.filter((l) => l.user_id).map((l) => l.user_id)).size,
    anon: new Set(dayLogs.filter((l) => !l.user_id).map((l) => l.ip_address))
      .size,
    events: dayLogs.length,
  }));

  const eventRows = [...events.entries()].map(([event, eventLogs]) => ({
    id: event,
    event,
    count: eventLogs.length,
    visitors: new Set(eventLogs.map(visitorKey)).size,
  }));

  const ipRows = [...ips.entries()].map(([ip, ipLogs]) => {
    const perMinute = new Map<string, number>();
    for (const log of ipLogs) {
      const minute = new Date(log.created_at).toISOString().slice(0, 16);
      perMinute.set(minute, (perMinute.get(minute) ?? 0) + 1);
    }
    return {
      id: ip,
      ip,
      events: ipLogs.length,
      peak: Math.max(...perMinute.values()),
      userAgents: new Set(ipLogs.map((l) => l.user_agent)).size,
      userAgent: ipLogs[0].user_agent,
    };
  });

  return (
    <>
      <Head>
        <title>Usage Analytics - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Usage Analytics
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          {RANGES.map((range) => (
            <Button
              key={range.label}
              variant="outlined"
              size="small"
              onClick={() => {
                setFrom(toInputDate(range.from()));
                setTo(toInputDate(new Date()));
              }}
            >
              {range.label}
            </Button>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <ToggleButtonGroup
            exclusive
            value={audience}
            onChange={(_, value) => value && setAudience(value)}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="user">Logged In</ToggleButton>
            <ToggleButton value="anon">Anonymous</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            disabled={isValidating}
            startIcon={
              isValidating ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={() => mutate()}
          >
            Refresh
          </Button>
        </Stack>

        <Typography sx={{ mb: 2 }}>
          {new Set(logs.map(visitorKey)).size} unique visitors, {logs.length}{" "}
          events
        </Typography>

        <Typography variant="h6">Per Day</Typography>
        <DataGrid
          autoHeight
          rows={dayRows}
          columns={dayColumns}
          loading={isValidating}
          initialState={{
            sorting: { sortModel: [{ field: "day", sort: "desc" }] },
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ mb: 2 }}
        />

        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: chartRows.map((row) => row.day),
                  datasets: [
                    {
                      label: "Events",
                      data: chartRows.map((row) => row.events),
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: theme.palette.secondary.main,
                      tension: 0.2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6">Top IPs</Typography>
        <DataGrid
          autoHeight
          rows={ipRows}
          columns={ipColumns}
          loading={isValidating}
          initialState={{
            sorting: { sortModel: [{ field: "events", sort: "desc" }] },
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ mb: 4 }}
        />

        <Typography variant="h6">Actions</Typography>
        <DataGrid
          autoHeight
          rows={eventRows}
          columns={eventColumns}
          loading={isValidating}
          initialState={{
            sorting: { sortModel: [{ field: "count", sort: "desc" }] },
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
