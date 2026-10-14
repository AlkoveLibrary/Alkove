import { AppBar, Link, Toolbar, Typography } from "@mui/material";
import NextLink from "next/link";
import { FC } from "react";
import { LIBRARY_NAME } from "config/config";
import { PAGES } from "constants/pages";

const FOOTER_YEAR = 2026;

export const Footer: FC = () => {
  return (
    <AppBar component="footer" position="static" sx={{ mt: 8 }}>
      <Toolbar
        variant="dense"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        <Typography variant="body2">
          {LIBRARY_NAME} {FOOTER_YEAR}
        </Typography>
        <Typography variant="body2" aria-hidden>
          |
        </Typography>
        <Link
          component={NextLink}
          href={PAGES.OPAC.ABOUT}
          color="inherit"
          underline="hover"
          variant="body2"
        >
          About
        </Link>
      </Toolbar>
    </AppBar>
  );
};
