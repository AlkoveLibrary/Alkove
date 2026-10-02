import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { Book, Copy, Transaction, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import useSWR from "swr";
import { axiosClient } from "util/axios";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { BasicUser } from "types/user";
import { CoverFull } from "components/CoverFull";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";
import { formatDate } from "util/format-date";
import { staffPlaceHoldRequest } from "requests/copy";

type CopyWithTransaction = Copy & {
  Transaction: (Transaction & { user: User })[];
};

type BookInfo = Book & {
  Copy: (Pick<Copy, "copy_id" | "location" | "condition" | "notes"> & {
    available: boolean;
  })[];
};

export default function BookDetailPage() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { book_id, type } = router.query as { book_id: string; type?: string };
  const isCheckin = type === "checkin";
  const isCheckout = type === "checkout";

  const { data: bookData, isLoading: bookLoading } = useSWR<{
    book: BookInfo | null;
  }>(book_id ? `opac/books/${book_id}` : null);

  const {
    data: copiesData,
    isLoading: copiesLoading,
    mutate: mutateCopies,
  } = useSWR<{
    copies: CopyWithTransaction[];
  }>(book_id ? `staff/copies?book_id=${book_id}` : null);

  const { data: usersData } = useSWR<{ users: BasicUser[] }>(
    isCheckout ? "staff/users" : null,
  );

  const [selectedCopy, setSelectedCopy] = useState<CopyWithTransaction | null>(
    null,
  );
  const [userQuery, setUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<BasicUser | null>(null);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const USER_PAGE_SIZE = 5;

  const allUsers = useMemo(() => usersData?.users ?? [], [usersData]);
  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q || !allUsers.length) return [];
    return allUsers.filter(
      (u) =>
        (u.first_name + " " + u.last_name).toLowerCase().includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false),
    );
  }, [userQuery, allUsers]);
  const userPageCount = Math.ceil(filteredUsers.length / USER_PAGE_SIZE);
  const pagedUsers = filteredUsers.slice(
    (userPage - 1) * USER_PAGE_SIZE,
    userPage * USER_PAGE_SIZE,
  );

  const handleCheckin = async () => {
    if (!selectedCopy) return;
    const tx = selectedCopy.Transaction.find((t) => t.checked_out_at);
    if (!tx) return;
    setTxSubmitting(true);
    try {
      await axiosClient.patch(`staff/transactions/${tx.transaction_id}`);
      mutateCopies();
      enqueueSnackbar("The copy has been successfully returned.", {
        variant: "success",
      });
      resetPhase();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      enqueueSnackbar(msg ?? "Failed to check in the copy", {
        variant: "error",
      });
      mutateCopies();
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedCopy || !selectedUser) return;
    setTxSubmitting(true);
    try {
      await axiosClient.post("staff/transactions", {
        user_id: selectedUser.user_id,
        copy_id: selectedCopy.copy_id,
      });
      mutateCopies();
      enqueueSnackbar(
        `Checked out to ${selectedUser.first_name} ${selectedUser.last_name}`,
        {
          variant: "success",
        },
      );
      resetPhase();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      enqueueSnackbar(msg ?? "Failed to check out the copy", {
        variant: "error",
      });
      mutateCopies();
    } finally {
      setTxSubmitting(false);
    }
  };

  const handlePlaceHold = async () => {
    if (!selectedCopy || !selectedUser) return;
    setTxSubmitting(true);
    try {
      await staffPlaceHoldRequest(selectedUser.user_id, selectedCopy.copy_id);
      mutateCopies();
      enqueueSnackbar(
        `Hold placed for ${selectedUser.first_name} ${selectedUser.last_name}`,
        {
          variant: "success",
        },
      );
      resetPhase();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      enqueueSnackbar(msg ?? "Failed to place the hold", {
        variant: "error",
      });
      mutateCopies();
    } finally {
      setTxSubmitting(false);
    }
  };

  const resetPhase = () => {
    setSelectedCopy(null);
    setSelectedUser(null);
    setUserQuery("");
  };

  const book = bookData?.book;
  const copies = useMemo(() => {
    const list = copiesData?.copies ?? [];
    return [...list].sort((a, b) => {
      const aAvail = !a.Transaction.some((t) => t.checked_out_at);
      const bAvail = !b.Transaction.some((t) => t.checked_out_at);
      if (isCheckin) return aAvail === bAvail ? 0 : aAvail ? 1 : -1;
      return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
    });
  }, [copiesData, isCheckin]);

  if (bookLoading || copiesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="text.secondary">
          Book not found.
        </Typography>
      </Box>
    );
  }

  if (selectedCopy) {
    const activeTransaction = selectedCopy.Transaction.find(
      (t) => t.checked_out_at,
    );
    const selectedHold = selectedCopy.Transaction.find(
      (t) => !t.checked_out_at,
    );
    const selectedHeld = Boolean(selectedHold);

    const RightPanel = () => {
      const SelectedCopyCard = () => (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12 }}>
            <Card
              variant="outlined"
              sx={{
                backgroundColor: activeTransaction
                  ? theme.palette.customRed.main
                  : selectedHeld
                    ? theme.palette.customYellow.main
                    : theme.palette.customGreen.main,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  {selectedCopy.location && (
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedCopy.location}
                    </Typography>
                  )}
                  {selectedCopy.condition && (
                    <Typography variant="body2">
                      <strong>Condition:</strong> {selectedCopy.condition}
                    </Typography>
                  )}
                  {selectedCopy.notes && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {selectedCopy.notes}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {activeTransaction
                      ? `Checked out to ${activeTransaction.user.first_name} ${activeTransaction.user.last_name}`
                      : selectedHold
                        ? "On hold"
                        : "Available"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );

      if (isCheckin) {
        return (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Check In
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="h6">Confirm Check In</Typography>
              <Button variant="outlined" size="small" onClick={resetPhase}>
                Back to Copies
              </Button>
            </Box>
            {SelectedCopyCard()}
            {activeTransaction && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: "bold" }}
                >
                  Checked out to
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {activeTransaction.user.first_name}{" "}
                  {activeTransaction.user.last_name}
                </Typography>
                {activeTransaction.user.email && (
                  <Typography variant="body2" color="text.secondary">
                    {activeTransaction.user.email}
                  </Typography>
                )}
                {activeTransaction.checked_out_at && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Since:{" "}
                    {new Date(
                      activeTransaction.checked_out_at,
                    ).toLocaleString()}
                  </Typography>
                )}
              </Paper>
            )}
            <Button
              variant="contained"
              color="success"
              fullWidth
              disabled={txSubmitting || !activeTransaction}
              onClick={handleCheckin}
            >
              {txSubmitting ? "Returning..." : "Confirm Check In"}
            </Button>
          </Box>
        );
      }

      return (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Check Out
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h6">Confirm Check Out</Typography>
            <Button variant="outlined" size="small" onClick={resetPhase}>
              Back to Copies
            </Button>
          </Box>
          {SelectedCopyCard()}
          {selectedHold ? (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                On hold for
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedHold.user.first_name} {selectedHold.user.last_name}
              </Typography>
              {selectedHold.user.email && (
                <Typography variant="body2" color="text.secondary">
                  {selectedHold.user.email}
                </Typography>
              )}
              {selectedHold.held_at && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Since: {formatDate(selectedHold.held_at, true)}
                </Typography>
              )}
            </Paper>
          ) : selectedUser ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </Typography>
                {selectedUser.email && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                onClick={() => {
                  setSelectedUser(null);
                }}
              >
                Change
              </Button>
            </Paper>
          ) : (
            <>
              <TextField
                label="Search by name or email"
                fullWidth
                size="small"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setUserPage(1);
                }}
                sx={{ mb: 1 }}
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
              {filteredUsers.length > 0 && (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    {filteredUsers.length}{" "}
                    {filteredUsers.length === 1 ? "user" : "users"} found
                  </Typography>
                  <List
                    dense
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    {pagedUsers.map((u) => (
                      <ListItemButton
                        key={u.user_id}
                        onClick={() => {
                          setSelectedUser(u);
                        }}
                      >
                        <ListItemText
                          primary={u.first_name + " " + u.last_name}
                          secondary={u.email}
                        />
                      </ListItemButton>
                    ))}
                  </List>{" "}
                  {userPageCount > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <Pagination
                        count={userPageCount}
                        page={userPage}
                        onChange={(_, value) => setUserPage(value)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  )}
                </>
              )}
              {userQuery.trim() && filteredUsers.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  No users found.
                </Typography>
              )}
            </>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={!selectedUser || txSubmitting}
              onClick={handleCheckout}
            >
              {txSubmitting ? "Checking out..." : "Confirm Check Out"}
            </Button>
            {!selectedHold && (
              <Button
                variant="outlined"
                fullWidth
                disabled={!selectedUser || txSubmitting}
                onClick={handlePlaceHold}
              >
                {txSubmitting ? "Placing hold..." : "Place Hold"}
              </Button>
            )}
          </Box>
        </Box>
      );
    };

    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <IconButton onClick={resetPhase} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CoverFull coverId={book.cover_id} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {book.title}
              </Typography>
              {book.author && (
                <Typography variant="body1" color="text.secondary">
                  {book.author}
                </Typography>
              )}
              <Chip
                label={book.isbn}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>{RightPanel()}</Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Book Transactions - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CoverFull coverId={book.cover_id} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {book.title}
              </Typography>
              {book.author && (
                <Typography variant="body1" color="text.secondary">
                  {book.author}
                </Typography>
              )}
              <Chip
                label={book.isbn}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {isCheckin ? "Check In" : isCheckout ? "Check Out" : "Copies"}
              </Typography>
              {(isCheckin || isCheckout) && (
                <IconButton
                  size="small"
                  title={
                    isCheckin ? "Switch to Check Out" : "Switch to Check In"
                  }
                  onClick={() =>
                    router.replace(
                      `${router.pathname}?book_id=${book_id}&type=${isCheckin ? "checkout" : "checkin"}`,
                    )
                  }
                >
                  <SyncAltIcon />
                </IconButton>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="h6">Copies ({copies.length})</Typography>
            </Box>

            {copies.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No copies available.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {copies.map((copy) => {
                  const borrow = copy.Transaction.find(
                    (t) => t.checked_out_at,
                  );
                  const held = copy.Transaction.some((t) => !t.checked_out_at);
                  const available = !borrow;
                  const selectable = isCheckin
                    ? !available
                    : isCheckout
                      ? available
                      : true;
                  return (
                    <Grid size={{ xs: 12 }} key={copy.copy_id}>
                      <Card
                        variant="outlined"
                        sx={{
                          backgroundColor:
                            available && held
                              ? theme.palette.customYellow.main
                              : selectable
                                ? theme.palette.customGreen.main
                                : theme.palette.customRed.main,
                        }}
                      >
                        <CardContent
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            {copy.location && (
                              <Typography variant="body2">
                                <strong>Location:</strong> {copy.location}
                              </Typography>
                            )}
                            {copy.condition && (
                              <Typography variant="body2">
                                <strong>Condition:</strong> {copy.condition}
                              </Typography>
                            )}
                            {copy.notes && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Notes:</strong> {copy.notes}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {borrow
                                ? `Checked out to ${borrow.user.first_name} ${borrow.user.last_name}`
                                : held
                                  ? "On hold"
                                  : "Available"}
                            </Typography>
                          </Box>
                          {selectable && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedCopy(copy);
                                const hold = copy.Transaction.find(
                                  (t) => !t.checked_out_at,
                                );
                                if (isCheckout && hold) {
                                  setSelectedUser(hold.user);
                                }
                              }}
                            >
                              {isCheckin
                                ? "Check In"
                                : isCheckout
                                  ? "Check Out"
                                  : "Select"}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
