import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  BookWithCopies,
  BookWithCopiesStaff,
  CopyWithAvailibility,
  CopyWithExtras,
} from "types/book";
import { useState } from "react";
import { EditCopyDialog } from "./EditCopyDialog";
import { KeyedMutator } from "swr";

export const CopyItem = ({
  copy,
  mutate,
  onPlaceHold,
  onCancelHold,
}: {
  copy: CopyWithAvailibility | CopyWithExtras;
  onPlaceHold?: () => void;
  onCancelHold?: () => void;
  mutate?:
    | KeyedMutator<{
        book: BookWithCopies | null;
      }>
    | KeyedMutator<{
        book: BookWithCopiesStaff | null;
      }>;
}) => {
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const heldBySelf = "held_by_self" in copy && copy.held_by_self;

  const cardPalette = heldBySelf
    ? theme.palette.customGreen
    : copy.held
      ? theme.palette.customYellow
      : copy.available
        ? theme.palette.customGreen
        : theme.palette.customRed;

  return (
    <Grid size={{ xs: 12 }} key={copy.copy_id}>
      {mutate && (
        <EditCopyDialog
          open={editDialogOpen}
          handleClose={() => setEditDialogOpen(false)}
          copy_id={copy.copy_id}
          mutateBook={mutate}
          initialValues={{
            location: copy.location ?? "",
            condition: copy.condition ?? "",
            notes: copy.notes ?? "",
          }}
          has_transactions={
            "has_transactions" in copy ? copy.has_transactions : false
          }
          available={copy.available}
          archived={copy.archived}
        />
      )}
      <Card
        variant="outlined"
        sx={
          copy.archived
            ? null
            : {
                backgroundColor: cardPalette.main,
                color: cardPalette.contrastText,
              }
        }
      >
        <CardContent sx={{ position: "relative", pb: "16px !important" }}>
          {mutate ? (
            <Button
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: 0,
                px: 1,
                py: 0.5,
                fontWeight: 500,
                textTransform: "none",
              }}
              aria-label="Edit Copy"
              variant="text"
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
          ) : null}
          {onPlaceHold && copy.available && !copy.archived ? (
            <Button
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: 0,
                px: 1,
                py: 0.5,
                fontWeight: 500,
                textTransform: "none",
              }}
              variant="contained"
              onClick={onPlaceHold}
            >
              Place hold
            </Button>
          ) : null}
          {onCancelHold && heldBySelf ? (
            <Button
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: 0,
                px: 1,
                py: 0.5,
                fontWeight: 500,
                textTransform: "none",
              }}
              variant="contained"
              onClick={onCancelHold}
            >
              Cancel hold
            </Button>
          ) : null}
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
            <Typography variant="body2">
              <strong>Notes:</strong> {copy.notes}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {copy.archived
              ? "Archived"
              : heldBySelf
                ? "On hold by you"
                : copy.held
                  ? "On hold"
                  : copy.available
                    ? "Available"
                    : "Checked out"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};
