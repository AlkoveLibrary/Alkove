import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useRouter } from "next/router";

import { FC, useContext, useState } from "react";
import { PAGES } from "constants/pages";
import AuthContext from "context/AuthContext";
import { useSnackbar } from "notistack";
import { useSettings } from "context/SettingsContext";

import { ROLE_IDS } from "constants/roles";
import { LIBRARY_NAME } from "config/config";

export const HeaderBar: FC = () => {
  const { logout, user } = useContext(AuthContext);
  const router = useRouter();
  const { settings, setSettings } = useSettings();
  const mode = settings.theme;
  const toggleMode = () =>
    setSettings({ ...settings, theme: mode === "light" ? "dark" : "light" });
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
    router.push(PAGES.LOGIN);
    enqueueSnackbar("Logged out successfully", { variant: "success" });
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push(PAGES.PROFILE);
  };

  const handleMyBooks = () => {
    handleMenuClose();
    router.push(PAGES.WEB_ACCESS.HOME);
  };

  const handleRequestBook = () => {
    handleMenuClose();
    router.push(PAGES.WEB_ACCESS.REQUEST);
  };

  const handlePublicCatalog = () => {
    handleMenuClose();
    router.push(PAGES.OPAC.HOME);
  };

  const handleAbout = () => {
    handleMenuClose();
    router.push(PAGES.OPAC.ABOUT);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5">{LIBRARY_NAME}</Typography>
          <Tooltip title={"Go to home page"}>
            <IconButton
              color="inherit"
              aria-label="home"
              onClick={() => {
                if (!user || user.role_id === ROLE_IDS.USER) {
                  router.push(PAGES.OPAC.HOME);
                } else if (user.role_id === ROLE_IDS.STAFF) {
                  router.push(PAGES.STAFF.HOME);
                } else if (user.role_id === ROLE_IDS.ADMIN) {
                  router.push(PAGES.ADMIN.HOME);
                }
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {user && (
            <Typography variant="body2">
              {user.first_name} {user.last_name}
            </Typography>
          )}

          {router.pathname !== PAGES.LOGIN &&
            (user ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                  aria-label="menu"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={handleProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleMyBooks}>My Books</MenuItem>
                  <MenuItem onClick={handleRequestBook}>
                    Request a Book
                  </MenuItem>
                  {user && user.role_id !== ROLE_IDS.USER ? (
                    <MenuItem onClick={handlePublicCatalog}>
                      Public Catalog
                    </MenuItem>
                  ) : null}

                  <MenuItem onClick={handleAbout}>About</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                onClick={() => router.push(PAGES.LOGIN)}
              >
                Login
              </Button>
            ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
