import {
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
  Box,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import {
  archiveCopyRequest,
  deleteCopyRequest,
  editCopyRequest,
} from "requests/copy";
import { KeyedMutator } from "swr";
import { BookWithCopies, BookWithCopiesStaff } from "types/book";

export const EditCopyDialog = ({
  handleClose,
  open,
  mutateBook,
  copy_id,
  initialValues,
  has_transactions,
  available,
  archived,
}: {
  mutateBook:
    | KeyedMutator<{
        book: BookWithCopies | null;
      }>
    | KeyedMutator<{
        book: BookWithCopiesStaff | null;
      }>;
  handleClose: () => void;
  open: boolean;
  copy_id: string;
  initialValues: {
    location: string;
    condition: string;
    notes: string;
  };
  has_transactions: boolean;
  available: boolean;
  archived: boolean;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(initialValues.location);
  const [condition, setCondition] = useState(initialValues.condition);
  const [notes, setNotes] = useState(initialValues.notes);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocation(initialValues.location);
    setCondition(initialValues.condition);
    setNotes(initialValues.notes);
    setError(null);
  }, [
    open,
    initialValues.location,
    initialValues.condition,
    initialValues.notes,
  ]);

  const handleEditCopy = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const nulledFields = {
        location: location.trim() || null,
        condition: condition.trim() || null,
        notes: notes.trim() || null,
      };

      await editCopyRequest(copy_id, nulledFields);
      handleClose();

      await mutateBook();
      enqueueSnackbar("Copy edited successfully", { variant: "success" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Failed to edit copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArchive = async () => {
    if (has_transactions) {
      setIsDeleting(true);
      try {
        await archiveCopyRequest(copy_id);
        handleClose();
        await mutateBook();
        enqueueSnackbar("Copy archived successfully", { variant: "success" });
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        enqueueSnackbar(msg ?? "Failed to archive copy", { variant: "error" });
      } finally {
        setIsDeleting(false);
      }
    } else {
      setIsDeleting(true);
      try {
        await deleteCopyRequest(copy_id);
        handleClose();
        await mutateBook();
        enqueueSnackbar("Copy deleted successfully", { variant: "success" });
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        enqueueSnackbar(msg ?? "Failed to delete copy", { variant: "error" });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Copy</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Autocomplete
          options={["Library", "Storage"]}
          value={location}
          onChange={(_e, value) => setLocation(value || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Location"
              margin="normal"
              fullWidth
              onChange={(e) => setLocation(e.target.value)}
            />
          )}
          freeSolo
        />
        <Autocomplete
          options={["Like New", "Good", "Poor"]}
          value={condition}
          onChange={(_e, newValue) => setCondition(newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Condition"
              margin="normal"
              fullWidth
              onChange={(e) => setCondition(e.target.value)}
            />
          )}
          freeSolo
        />
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button
            variant="contained"
            onClick={handleDeleteArchive}
            disabled={isDeleting || isSubmitting || !available}
            color="error"
          >
            {has_transactions ? (archived ? "Unarchive" : "Archive") : "Delete"}
          </Button>
        </Box>
        <Box sx={{ gap: 1 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditCopy}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
