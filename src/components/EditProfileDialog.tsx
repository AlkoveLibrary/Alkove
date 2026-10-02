import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import AuthContext from "context/AuthContext";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { updateUserProfileRequest } from "requests/user";

export const EditProfileDialog: React.FC<{
  handleClose: () => void;
  open: boolean;
  initialValues: {
    first_name: string;
    last_name: string;
  };
}> = ({ handleClose, open, initialValues }) => {
  const { refreshUser } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(initialValues.first_name);
  const [lastName, setLastName] = useState(initialValues.last_name);

  const [changingProfile, setChangingProfile] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(initialValues.first_name);
    setLastName(initialValues.last_name);
  }, [open, initialValues.first_name, initialValues.last_name]);

  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setChangingProfile(true);
    try {
      await updateUserProfileRequest({
        first_name: firstName,
        last_name: lastName,
      });
      await refreshUser();
      enqueueSnackbar("Profile updated successfully", { variant: "success" });

      handleClose();
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update profile";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setChangingProfile(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: "16px !important",
        }}
      >
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={changingProfile}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={changingProfile || !firstName || !lastName}
        >
          {changingProfile ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
