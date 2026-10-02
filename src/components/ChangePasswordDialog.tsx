import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  DialogActions,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { PAGES } from "constants/pages";
import AuthContext from "context/AuthContext";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { changePasswordRequest } from "requests/auth";

export const ChangePasswordDialog: React.FC<{
  handleClose: () => void;
  open: boolean;
  mfaEnabled: boolean;
}> = ({ handleClose, open, mfaEnabled }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { logoutNoRequest } = useContext(AuthContext);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("New passwords do not match", { variant: "error" });
      return;
    }
    setChangingPassword(true);
    try {
      const response = await changePasswordRequest({
        oldPassword,
        newPassword,
      });
      if (response.revalidated) {
        enqueueSnackbar("Password changed successfully", {
          variant: "success",
        });
        handleClose();
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        enqueueSnackbar("Password changed successfully. Please log in again.", {
          variant: "success",
        });
        await logoutNoRequest();
        router.push(PAGES.LOGIN);
      }
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setChangingPassword(false);
    }
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "16px !important",
        }}
      >
        <TextField
          label="Current Password"
          type={showOldPassword ? "text" : "password"}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          fullWidth
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Typography variant="body2" color="text.secondary">
          {mfaEnabled
            ? "Because MFA is enabled, changing your password will log you out of all other sessions on other devices, including this one. You will need to log in again with your new password and MFA."
            : "Changing password will log you out of all other sessions on other devices."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={changingPassword}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleChangePassword}
          disabled={
            changingPassword || !oldPassword || !newPassword || !confirmPassword
          }
        >
          {changingPassword ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
