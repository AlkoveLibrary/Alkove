import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ChipProps,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useSWR from "swr";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";
import { BookWithCover } from "types/book";
import { createCoverRequest } from "requests/cover";

type CoverUploadStatus =
  "pending" | "uploading" | "done" | "failed" | "has_cover" | "no_match";

const STATUSES: Record<
  CoverUploadStatus,
  { label: string; color: ChipProps["color"] }
> = {
  pending: { label: "Pending", color: "default" },
  uploading: { label: "Uploading", color: "info" },
  done: { label: "Done", color: "success" },
  failed: { label: "Failed", color: "error" },
  has_cover: { label: "Already has cover", color: "warning" },
  no_match: { label: "No matching book", color: "secondary" },
};

const codeSx = {
  fontFamily: "monospace",
  bgcolor: "action.hover",
  px: 0.75,
  py: 0.25,
  borderRadius: 1,
};

type CoverUpload = {
  file: File;
  book_id: string | null;
  status: CoverUploadStatus;
  error?: string;
};

export default function BulkUploadCoversPage() {
  const router = useRouter();
  const { data } = useSWR<{ books: BookWithCover[] }>("admin/books");
  const [uploads, setUploads] = useState<CoverUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusCounts = (Object.keys(STATUSES) as CoverUploadStatus[])
    .map((status) => ({
      status,
      count: uploads.filter((upload) => upload.status === status).length,
    }))
    .filter(({ count }) => count > 0);

  const setStatus = (
    index: number,
    status: CoverUploadStatus,
    error?: string,
  ) =>
    setUploads((prev) =>
      prev.map((upload, idx) =>
        idx === index ? { ...upload, status, error } : upload,
      ),
    );

  const handleSelect = (files: File[]) => {
    setProgress({ done: 0, total: 0 });
    setUploads(
      files.map((file) => {
        const isbn = file.name.replace(/\.(jpe?g|png)$/i, "");
        const book = data?.books.find((b) => b.isbn === isbn);
        if (!book) return { file, book_id: null, status: "no_match" };
        if (book.cover_id) return { file, book_id: null, status: "has_cover" };
        return { file, book_id: book.book_id, status: "pending" };
      }),
    );
  };

  const handleUpload = async () => {
    const pending = uploads.flatMap((upload, index) =>
      upload.status === "pending" && upload.book_id
        ? [{ index, file: upload.file, book_id: upload.book_id }]
        : [],
    );
    setUploading(true);
    setProgress({ done: 0, total: pending.length });

    for (const { index, file, book_id } of pending) {
      setStatus(index, "uploading");
      try {
        await createCoverRequest(file, book_id);
        setStatus(index, "done");
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setStatus(index, "failed", msg);
      }
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    setUploading(false);
  };

  return (
    <>
      <Head>
        <title>Bulk Upload Covers - {LIBRARY_NAME}</title>
      </Head>
      {progress.total > 0 && (
        <LinearProgress
          variant="determinate"
          value={(progress.done / progress.total) * 100}
        />
      )}
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
            Bulk Upload Covers
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => handleSelect(Array.from(e.target.files ?? []))}
            />
            <Button
              variant="outlined"
              disabled={!data || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <Button
              variant="contained"
              disabled={uploads.length === 0 || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </Box>
        </Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Instructions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Select multiple cover image files for bulk upload. Name the file
              with the ISBN of the book it will be applied to. For example,{" "}
              <Box component="code" sx={codeSx}>
                123456789X.jpg
              </Box>{" "}
              and{" "}
              <Box component="code" sx={codeSx}>
                9781234567897.png
              </Box>{" "}
              are valid inputs.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Books with existing covers will be skipped.
            </Typography>
          </CardContent>
        </Card>
        {statusCounts.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            {statusCounts.map(({ status, count }) => (
              <Box
                key={status}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Chip
                  size="small"
                  label={STATUSES[status].label}
                  color={STATUSES[status].color}
                />
                <Typography variant="body2">{count}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {progress.total > 0 && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {progress.done} / {progress.total} uploaded
          </Typography>
        )}
        <DataGrid
          rows={uploads.map((upload, idx) => ({
            id: idx,
            name: upload.file.name,
            type: upload.file.type,
            size: upload.file.size,
            status: upload.status,
            error: upload.error,
          }))}
          columns={[
            { field: "name", headerName: "File Name", flex: 2, minWidth: 200 },
            { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
            {
              field: "size",
              headerName: "Size (KB)",
              flex: 1,
              minWidth: 100,
              valueFormatter: (value: number) => (value / 1024).toFixed(1),
            },
            {
              field: "status",
              headerName: "Status",
              flex: 1,
              minWidth: 180,
              renderCell: ({ row }) => (
                <Chip
                  size="small"
                  label={row.error ?? STATUSES[row.status].label}
                  color={STATUSES[row.status].color}
                />
              ),
            },
          ]}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{ backgroundColor: "background.paper" }}
          autoHeight
        />
      </Box>
    </>
  );
}
