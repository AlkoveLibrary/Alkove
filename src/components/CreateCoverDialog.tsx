import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";

interface CreateCoverDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (file: File) => void;
}

export default function CreateCoverDialog({
  open,
  onClose,
  onSubmit,
}: CreateCoverDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (selectedFile && onSubmit) {
      onSubmit(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleDialogClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Cover Image</DialogTitle>
      <DialogContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="outlined"
          onClick={handleSelectClick}
          fullWidth
          sx={{ mb: 2 }}
        >
          Select Image
        </Button>
        {selectedFile && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {selectedFile.name}
            </Typography>
            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile}
        >
          Upload Image
        </Button>
      </DialogActions>
    </Dialog>
  );
}
