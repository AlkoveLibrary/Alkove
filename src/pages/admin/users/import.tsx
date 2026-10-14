import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { BulkResult, ImportUser } from "types/user";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function UsersPage() {
  const sampleUser = [
    {
      first_name: "Hank",
      last_name: "Hill",
      email: "hank.hill@example.com",
    },
    { first_name: "Bobby", last_name: "Hill", email: "" },
  ];
  const router = useRouter();

  const [usersToImport, setUsersToImport] = useState<ImportUser[]>([]);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "warning" | "error";
  }>({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Head>
        <title>Bulk User Import - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Example user import format:
            </Typography>
            <Box
              component="pre"
              sx={{
                padding: 0,
                margin: 0,
                overflowX: "auto",
                fontFamily: "monospace",
                fontSize: "1rem",
              }}
            >
              {JSON.stringify(sampleUser, null, 2)}
            </Box>
          </CardContent>
        </Card>
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
            Admin User Bulk Importer
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <input
              type="file"
              accept="application/json,.json"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (
                  file.type !== "application/json" &&
                  !file.name.toLowerCase().endsWith(".json")
                ) {
                  setImportError("Only .json files are accepted");
                  return;
                }
                try {
                  const text = await file.text();
                  const json = JSON.parse(text);
                  setUsersToImport(Array.isArray(json) ? json : [json]);
                  setResults([]); // Clear previous results on new import
                  setImportError(null);
                } catch {
                  setImportError("Invalid JSON file");
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={usersToImport.length === 0 || loading}
              onClick={async () => {
                setLoading(true);
                setImportError(null);
                setSnackbar({ open: false, message: "", severity: "success" });
                try {
                  const cleanedUsers = usersToImport.map((u) => ({
                    first_name: u.first_name.trim(),
                    last_name: u.last_name.trim(),
                    email: u.email?.trim() ? u.email?.trim() : undefined,
                  }));
                  setUsersToImport(cleanedUsers);

                  const response = await axios.post(
                    "/api/admin/users/create-bulk",
                    { users: cleanedUsers },
                  );
                  if (response.data && Array.isArray(response.data.results)) {
                    // Merge user fields into results for display
                    const mergedResults = response.data.results.map(
                      (r: BulkResult) => ({
                        ...r,
                        ...cleanedUsers[r.index],
                      }),
                    );
                    setResults(mergedResults);
                    const total = mergedResults.length;
                    const successCount = mergedResults.filter(
                      (r: { created: boolean | null }) => r.created,
                    ).length;
                    if (successCount === total) {
                      setSnackbar({
                        open: true,
                        message: `All ${total} users created successfully.`,
                        severity: "success",
                      });
                    } else if (successCount > 0) {
                      setSnackbar({
                        open: true,
                        message: `${successCount} of ${total} users created. Some errors occurred.`,
                        severity: "warning",
                      });
                    } else {
                      setSnackbar({
                        open: true,
                        message: `All ${total} user creations failed.`,
                        severity: "error",
                      });
                    }
                  } else {
                    setImportError("Unexpected response from server");
                    setSnackbar({
                      open: true,
                      message: "Unexpected response from server",
                      severity: "error",
                    });
                  }
                } catch (err) {
                  const message =
                    err instanceof Error ? err.message : "Bulk create failed";
                  setImportError(message);
                  setSnackbar({
                    open: true,
                    message: "Bulk create failed",
                    severity: "error",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </Box>
        </Box>
        {importError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {importError}
          </Alert>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box sx={{ height: 500, width: "100%", mb: 2 }}>
          <DataGrid
            rows={
              results.length > 0
                ? results.map((row, idx) => ({
                    id: idx,
                    ...usersToImport[row.index],
                    created: row.created,
                    message: row.message,
                  }))
                : usersToImport.map((user, idx) => ({
                    id: idx,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email ?? "-",
                    created: null,
                    message: "",
                  }))
            }
            columns={[
              {
                field: "first_name",
                headerName: "First Name",
                flex: 1,
                minWidth: 120,
              },
              {
                field: "last_name",
                headerName: "Last Name",
                flex: 1,
                minWidth: 120,
              },
              { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
              {
                field: "created",
                headerName: "Created",
                flex: 1,
                minWidth: 100,
              },
              {
                field: "message",
                headerName: "Message",
                flex: 2,
                minWidth: 200,
              },
            ]}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{ cursor: "pointer", backgroundColor: "background.paper" }}
            autoHeight
          />
        </Box>
      </Box>
    </>
  );
}
