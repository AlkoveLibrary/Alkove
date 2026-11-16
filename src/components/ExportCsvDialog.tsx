import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Radio,
  Switch,
  RadioGroup,
  Typography,
} from "@mui/material";
import { ExportField, SortDirection } from "constants/export";
import { useSnackbar } from "notistack";
import { useState } from "react";

interface ExportCsvDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  fields: readonly ExportField[];
  defaultSortBy: string;
  exportRequest: (
    fields: string[],
    sortBy: string,
    sortDirection: SortDirection,
  ) => Promise<{ csv: string }>;
}

const ExportCsvDialog: React.FC<ExportCsvDialogProps> = ({
  open,
  onClose,
  title,
  fileName,
  fields,
  defaultSortBy,
  exportRequest,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState<string[]>(
    fields.map((field) => field.key),
  );
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [exporting, setExporting] = useState(false);

  const allSelected = selected.length === fields.length;

  const toggleField = (key: string) =>
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const handleExport = async () => {
    setExporting(true);
    try {
      const orderedFields = fields
        .map((field) => field.key)
        .filter((key) => selected.includes(key));
      const { csv } = await exportRequest(orderedFields, sortBy, sortDirection);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      enqueueSnackbar("Export downloaded", { variant: "success" });
      onClose();
    } catch {
      enqueueSnackbar("Failed to export", { variant: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                onChange={() =>
                  setSelected(
                    allSelected ? [] : fields.map((field) => field.key),
                  )
                }
              />
            }
            label="Select All"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Sort By
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={sortDirection === "desc"}
                  onChange={(event) =>
                    setSortDirection(event.target.checked ? "desc" : "asc")
                  }
                />
              }
              label={sortDirection === "desc" ? "Descending" : "Ascending"}
              slotProps={{ typography: { variant: "body2" } }}
              sx={{ mr: 0 }}
            />
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <RadioGroup
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          {fields.map((field) => (
            <Box
              key={field.key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                  />
                }
                label={field.label}
              />
              <Radio
                size="small"
                value={field.key}
                slotProps={{
                  input: { "aria-label": `Sort by ${field.label}` },
                }}
              />
            </Box>
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={selected.length === 0 || exporting}
        >
          {exporting ? "Exporting..." : "Download CSV"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportCsvDialog;
