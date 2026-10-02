import {
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { createCopyRequest } from "requests/book";
import { KeyedMutator } from "swr";
import { BookWithCopiesStaff } from "types/book";

export const CreateCopyDialog = ({
  handleClose,
  open,
  mutateBook,
  book_id,
}: {
  mutateBook: KeyedMutator<{
    book: BookWithCopiesStaff | null;
  }>;
  handleClose: () => void;
  open: boolean;
  book_id: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreateCopy = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createCopyRequest({ book_id, location, condition, notes });
      handleClose();
      setLocation("");
      setCondition("");
      setNotes("");
      await mutateBook();
      enqueueSnackbar("Copy created successfully", { variant: "success" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Failed to create copy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Copy</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Autocomplete
          options={["Library", "Storage"]}
          value={location}
          onChange={(_e, newValue) => setLocation(newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Location"
              margin="normal"
              fullWidth
              autoFocus
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
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateCopy}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
