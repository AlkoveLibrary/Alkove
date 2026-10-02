import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Book, Copy, Role, Transaction, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { useSnackbar } from "notistack";
import { withSnackbar } from "util/snackbar-request";
import {
  removeFromWebUserRequest,
  requestDeleteUser,
  upgradeToWebUserRequest,
} from "requests/user";
import CreateUserDialog from "components/CreateUserDialog";
import { ROLE_IDS } from "constants/roles";
import { PAGES } from "constants/pages";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

type UserFull = User & {
  role: Role;
  Transaction: (Transaction & { copy: Copy & { book: Book } })[];
};

export default function UserDetailPage() {
  const router = useRouter();
  const { user_id } = router.query as { user_id: string };

  const { data, isLoading, mutate } = useSWR<{ user: UserFull | null }>(
    user_id ? `staff/users/${user_id}` : null,
  );

  const { enqueueSnackbar } = useSnackbar();
  const [promoting, setPromoting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const user = data?.user;

  const handleRemoveWebAccess = async () => {
    setPromoting(true);
    await withSnackbar(
      () => removeFromWebUserRequest(user_id),
      "User web access revoked",
      "Failed to revoke user web access",
      enqueueSnackbar,
    );
    await mutate();
    setPromoting(false);
    setConfirmRemove(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="text.secondary">
          User not found.
        </Typography>
      </Box>
    );
  }

  const handleDelete = async () => {
    try {
      await requestDeleteUser(user_id);
      enqueueSnackbar("User deleted", { variant: "success" });
      router.push(PAGES.STAFF.USERS.HOME);
    } catch {
      enqueueSnackbar("Failed to delete user", { variant: "error" });
    }
  };
  return (
    <>
      <Head>
        <title>User Details - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <CreateUserDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onCreated={() => mutate()}
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email ?? "",
            user_id: user.user_id,
          }}
          editMode
          disableEmail={Boolean(user.auth_id)}
        />
        <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)}>
          <DialogTitle>Confirm Web Access Removal</DialogTitle>
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography gutterBottom>
              Are you sure you want to remove web access for this user? They
              will no longer be able to log in, but they will still be able
              check out and check in books in person. Their transactions and
              account will remain intact.
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
                onClick={() => setConfirmRemove(false)}
                disabled={promoting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRemoveWebAccess}
                disabled={promoting}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Dialog>

        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold" }}
                  gutterBottom
                >
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography
                  variant="body1"
                  color={user.email ? "text.secondary" : "text.disabled"}
                  gutterBottom
                >
                  {user.email ?? "No email on record"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  {user.role.role_id !== ROLE_IDS.USER ? (
                    <Chip label={user.role.name} size="small" />
                  ) : (
                    <Chip
                      label={user.auth_id ? "Web Access User" : "Local User"}
                      size="small"
                      color={user.auth_id ? "success" : "default"}
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEditOpen(true);
                  }}
                  disabled={user.role_id !== ROLE_IDS.USER}
                >
                  Edit User
                </Button>
                {user.auth_id ? (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={promoting || user.role_id !== ROLE_IDS.USER}
                    color="error"
                    onClick={() => setConfirmRemove(true)}
                  >
                    Remove Web Access
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!!user.auth_id || !user.email || promoting}
                    onClick={async () => {
                      setPromoting(true);
                      await withSnackbar(
                        () => upgradeToWebUserRequest(user_id),
                        "User upgraded to web access",
                        "Failed to upgrade user",
                        enqueueSnackbar,
                      );
                      await mutate();
                      setPromoting(false);
                    }}
                  >
                    Upgrade to Web User
                  </Button>
                )}
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    handleDelete();
                  }}
                  disabled={
                    user.auth_id !== null || user.Transaction.length > 0
                  }
                >
                  Delete User
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Transaction History ({user.Transaction.length})
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Checked Out</TableCell>
                <TableCell>Checked In</TableCell>
                <TableCell>Held On</TableCell>
                <TableCell>Hold Cancelled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.Transaction.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No transactions.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                user.Transaction.map((tx) => (
                  <TableRow key={tx.transaction_id}>
                    <TableCell>{tx.copy.book.title}</TableCell>
                    <TableCell>
                      {tx.checked_in_at ? (
                        <Chip label="Returned" size="small" color="success" />
                      ) : tx.checked_out_at ? (
                        <Chip label="Borrowed" size="small" color="warning" />
                      ) : tx.hold_cancelled_at ? (
                        <Chip label="Cancelled" size="small" />
                      ) : (
                        <Chip
                          label="Hold"
                          size="small"
                          sx={{
                            backgroundColor: (theme) =>
                              theme.palette.customYellow.main,
                            color: (theme) =>
                              theme.palette.customYellow.contrastText,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {tx.checked_out_at
                        ? new Date(tx.checked_out_at).toLocaleDateString()
                        : null}
                    </TableCell>
                    <TableCell>
                      {tx.checked_in_at
                        ? new Date(tx.checked_in_at).toLocaleDateString()
                        : null}
                    </TableCell>
                    <TableCell>
                      {tx.held_at
                        ? new Date(tx.held_at).toLocaleDateString()
                        : null}
                    </TableCell>
                    <TableCell>
                      {tx.hold_cancelled_at
                        ? new Date(tx.hold_cancelled_at).toLocaleDateString()
                        : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
