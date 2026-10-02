import { Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

interface CoverDialogProps {
  open: boolean;
  handleClose: () => void;
  url: string;
}

const ViewFullCoverDialog: React.FC<CoverDialogProps> = ({
  open,
  handleClose,
  url,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            m: 2,
            p: 0,
            background: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            width: "calc(100vw - 32px)",
            height: "calc(100vh - 32px)",
          },
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </Dialog>
  );
};

export default ViewFullCoverDialog;
