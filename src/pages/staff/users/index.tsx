import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { PAGES } from "constants/pages";
import CreateUserDialog from "components/CreateUserDialog";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function UsersPage() {
  const router = useRouter();
  const { data, mutate } = useSWR<{ users: User[] }>("staff/users");

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const q = search.trim().toLowerCase();
  const rows = (data?.users ?? [])
    .filter(
      (u) =>
        !q ||
        (u.first_name + " " + u.last_name).toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q),
    )
    .map((user) => ({
      ...user,
      name: user.first_name + " " + user.last_name,
    }));

  const columns: GridColDef<User>[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value) => value ?? "-",
    },
    {
      field: "auth_id",
      headerName: "Web Access",
      width: 130,
      sortable: false,
      renderCell: ({ value }) =>
        value ? (
          <Chip label="Yes" color="success" size="small" />
        ) : (
          <Chip label="No" color="error" size="small" />
        ),
    },
  ];

  return (
    <>
      <Head>
        <title>Staff - Users - {LIBRARY_NAME}</title>
      </Head>
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
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Users
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Create
          </Button>
        </Box>
        <TextField
          placeholder="Search by name or email..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.user_id}
          onRowClick={(params: GridRowParams<User>) =>
            router.push(
              PAGES.STAFF.USERS.USER.replace("[user_id]", params.row.user_id),
            )
          }
          sx={{ cursor: "pointer" }}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
        />

        <CreateUserDialog
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => mutate()}
        />
      </Box>
    </>
  );
}
