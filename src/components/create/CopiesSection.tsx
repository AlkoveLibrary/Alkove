import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Autocomplete,
} from "@mui/material";
import { CreateCopyParams } from "types/book";

interface CopiesSectionProps {
  copies: CreateCopyParams[];
  onAddCopy: () => void;
  onRemoveCopy: (index: number) => void;
  onDuplicateCopy: (index: number) => void;
  onCopyChange: (
    index: number,
    field: keyof CreateCopyParams,
    value: string,
  ) => void;
}

export default function CopiesSection({
  copies,
  onAddCopy,
  onRemoveCopy,
  onDuplicateCopy,
  onCopyChange,
}: CopiesSectionProps) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
        Copies ({copies.length})
      </Typography>
      {copies.map((copy, idx) => (
        <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Copy {idx + 1}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" onClick={() => onDuplicateCopy(idx)}>
                Duplicate
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => onRemoveCopy(idx)}
              >
                Remove
              </Button>
            </Box>
          </Box>
          <Autocomplete
            options={["Library", "Storage"]}
            value={copy.location}
            onChange={(_e, newValue) =>
              onCopyChange(idx, "location", newValue || "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                onChange={(e) => onCopyChange(idx, "location", e.target.value)}
              />
            )}
            freeSolo
          />
          <Autocomplete
            options={["Like New", "Good", "Poor"]}
            value={copy.condition}
            onChange={(_e, newValue) =>
              onCopyChange(idx, "condition", newValue || "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Condition"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                onChange={(e) => onCopyChange(idx, "condition", e.target.value)}
              />
            )}
            freeSolo
          />
          <TextField
            label="Notes"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={copy.notes}
            onChange={(e) => onCopyChange(idx, "notes", e.target.value)}
          />
        </Paper>
      ))}
      <Button variant="outlined" fullWidth onClick={onAddCopy} sx={{ mb: 2 }}>
        + Add A{copies.length > 0 ? "nother" : ""} Copy
      </Button>
      <Divider />
    </>
  );
}
