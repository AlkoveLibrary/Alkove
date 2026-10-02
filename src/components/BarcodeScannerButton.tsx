import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
  ssr: false,
});

interface BarcodeScanResult {
  getText: () => string;
}

interface BarcodeScannerButtonProps {
  onScan: (text: string) => void;
  sx?: ButtonProps["sx"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BarcodeScannerButton({
  onScan,
  sx,
  open,
  onOpenChange,
}: BarcodeScannerButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const scanOpen = open !== undefined ? open : internalOpen;
  const setScanOpen = onOpenChange ?? setInternalOpen;
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanFrames, setScanFrames] = useState(0);

  const handleScanUpdate = (err: unknown, result?: BarcodeScanResult) => {
    setScanFrames((n) => n + 1);
    if (result) {
      const text = result.getText();
      setScanOpen(false);
      setScanError(null);
      setScanFrames(0);
      onScan(text);
    }
  };

  const handleScanError = (err: string | DOMException) => {
    const msg = typeof err === "string" ? err : err.message;
    setScanError(msg);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeScannerIcon />}
        onClick={() => {
          setScanOpen(true);
          setScanError(null);
          setScanFrames(0);
        }}
        sx={sx}
      >
        Scan Barcode
      </Button>

      <Dialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: scanFrames > 0 ? "success.main" : "grey.500",
                flexShrink: 0,
              }}
            />
            Scan Barcode
          </Box>
          <IconButton onClick={() => setScanOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {scanError ? (
            <Typography color="error">{scanError}</Typography>
          ) : (
            <BarcodeScanner
              width="100%"
              height={480}
              onUpdate={handleScanUpdate}
              onError={handleScanError}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
