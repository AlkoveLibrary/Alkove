import { Box, Button, Typography, Divider } from "@mui/material";
import { useContext, useState } from "react";
import { ChangePasswordDialog } from "components/ChangePasswordDialog";
import { EditProfileDialog } from "components/EditProfileDialog";
import AuthContext from "context/AuthContext";
import useSWR from "swr";
import { ChangeMfaDialog } from "components/ChangeMfaModal";
import { LIBRARY_NAME, MANDATORY_MFA_ROLES } from "config/config";
import Head from "next/head";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [enableMfaOpen, setEnableMfaOpen] = useState(false);

  const { data, mutate } = useSWR<{ mfaEnabled: boolean }>(
    user ? "auth/mfa" : null,
  );
  const mfaMandatory = user
    ? MANDATORY_MFA_ROLES.includes(user.role_id)
    : false;

  return (
    <>
      <Head>
        <title>User Profile - {LIBRARY_NAME}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            gap: 3,
            px: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            User Profile
          </Typography>

          {user && (
            <Box
              sx={{
                width: "100%",
                maxWidth: 480,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {user.first_name} {user.last_name}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {user.email ?? "-"}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {user.role.name}
                </Typography>
              </Box>

              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Divider />

              <Box
                sx={{ mt: 1, gap: 1, display: "flex", flexDirection: "column" }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setEditProfileOpen(true)}
                >
                  Change Name
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
                {mfaMandatory && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    MFA is mandatory for {user.role.name.toLowerCase()} accounts
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setEnableMfaOpen(true)}
                  disabled={!data || mfaMandatory}
                >
                  {data?.mfaEnabled ? "Disable MFA" : "Enable MFA"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <ChangePasswordDialog
          open={changePasswordOpen}
          handleClose={() => setChangePasswordOpen(false)}
          mfaEnabled={data?.mfaEnabled ?? false}
        />
        {user ? (
          <EditProfileDialog
            open={editProfileOpen}
            handleClose={() => setEditProfileOpen(false)}
            initialValues={{
              first_name: user.first_name,
              last_name: user.last_name,
            }}
          />
        ) : null}

        <ChangeMfaDialog
          open={enableMfaOpen}
          handleClose={() => setEnableMfaOpen(false)}
          mutate={async () => {
            await mutate();
          }}
          mfaEnabled={data?.mfaEnabled ?? false}
        />
      </Box>
    </>
  );
}
