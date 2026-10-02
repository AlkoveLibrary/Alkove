import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { getMfaEnabledAdminRequest } from "requests/auth";

import SearchIcon from "@mui/icons-material/Search";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { UserWithRole } from "types/user";
import { formatDate } from "util/format-date";
import AdminUserDialog from "components/AdminUserDialog";
import { PAGES } from "constants/pages";
import { ROLE_IDS } from "constants/roles";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function UsersPage() {
  const router = useRouter();
  const { data, mutate } = useSWR<{ users: UserWithRole[] }>("admin/users");

  const [searchQuery, setSearchQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserWithRole>();

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data?.users ?? [];
    if (!data) return [];
    return data.users.filter(
      (u) =>
        (u.first_name + " " + u.last_name).toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false),
    );
  }, [searchQuery, data]);

  return (
    <>
      <Head>
        <title>Admin - User Manager - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
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
            Admin User Manager
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Create
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push(PAGES.ADMIN.USERS.IMPORT)}
            >
              Bulk Import
            </Button>
          </Box>
        </Box>
        <TextField
          placeholder="Search users"
          size="small"
          sx={{ mb: 2 }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          value={searchQuery}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ height: 500, width: "100%", mb: 2 }}>
          <DataGrid
            rows={filteredUsers.map((user) => ({
              id: user.user_id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email ?? "-",

              last_login: user.last_login,
              last_activity: user.last_activity,
              auth_id: user.auth_id ? "Yes" : "No",
              actions_user_id: user.user_id,
              user_id: user.user_id,
              role_name:
                user.role_id === ROLE_IDS.USER
                  ? user.auth_id
                    ? "Web User"
                    : "Local User"
                  : user.role.name,
            }))}
            columns={[
              { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
              { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
              {
                field: "role_name",
                headerName: "Role",
                flex: 1,
                minWidth: 100,
              },
              {
                field: "last_login",
                headerName: "Last Login",
                flex: 1,
                minWidth: 180,
                valueFormatter: (value) => formatDate(value),
              },
              {
                field: "last_activity",
                headerName: "Last Activity",
                flex: 1,
                minWidth: 180,
                valueFormatter: (value) => formatDate(value),
              },
              {
                field: "user_id",
                headerName: "User ID",
                flex: 1,
                minWidth: 250,
              },
              {
                field: "action_user_id",
                headerName: "Actions",
                minWidth: 160,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                  return (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={async (event) => {
                        event.stopPropagation();
                        try {
                          const res = await getMfaEnabledAdminRequest(
                            params.id as string,
                          );
                          alert(
                            `MFA enabled: ${res.mfaEnabled ? "Yes" : "No"}`,
                          );
                        } catch {
                          alert("Failed to fetch MFA status");
                        }
                      }}
                    >
                      MFA Status
                    </Button>
                  );
                },
              },
            ]}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            onRowClick={(params) =>
              setUser(data?.users.find((u) => u.user_id === params.id))
            }
            sx={{ cursor: "pointer", backgroundColor: "background.paper" }}
            autoHeight
          />
        </Box>

        <AdminUserDialog
          open={open || Boolean(user)}
          onClose={() => {
            setOpen(false);
            setUser(undefined);
          }}
          onCreated={mutate}
          user={user}
        />
      </Box>
    </>
  );
}
