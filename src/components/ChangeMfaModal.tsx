import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { setMfaEnabledRequest } from "requests/auth";

export const ChangeMfaDialog: React.FC<{
  handleClose: () => void;
  open: boolean;
  mutate: () => Promise<void>;
  mfaEnabled: boolean;
}> = ({ handleClose, open, mutate, mfaEnabled }) => {
  const [changingMfa, setChangingMfa] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSetMfaEnabled = async (enabled: boolean) => {
    setChangingMfa(true);
    try {
      await setMfaEnabledRequest(enabled);
      await mutate();
      enqueueSnackbar(`MFA ${enabled ? "enabled" : "disabled"} successfully`, {
        variant: "success",
      });
      handleClose();
    } catch {
      enqueueSnackbar(`Failed to ${enabled ? "enable" : "disable"} MFA`, {
        variant: "error",
      });
    }
    setChangingMfa(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change MFA</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "16px !important",
        }}
      >
        <Typography>
          {mfaEnabled
            ? "Are you sure you want to disable MFA? The next time you log in, you will not be prompted for MFA."
            : "Are you sure you want to enable MFA? The next time you log in, you will be prompted for a one-time password that is sent to your email, in addition to your regular password."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={() => handleSetMfaEnabled(!mfaEnabled)}
          disabled={changingMfa}
        >
          {changingMfa ? "Saving..." : mfaEnabled ? "Disable MFA" : "Enable MFA"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
