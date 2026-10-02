import React from "react";

import { SWRConfig } from "swr";
import { SnackbarProvider } from "notistack";
import { fetcher } from "util/axios";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "../context/AuthContext";
import { HeaderBar } from "./HeaderBar";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { getTheme } from "theme/theme";

export const Providers: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SettingsProvider>
      <SettingsThemeProviders>{children}</SettingsThemeProviders>
    </SettingsProvider>
  );
};

const SettingsThemeProviders: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useSettings();
  const mode = settings.theme;

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <SnackbarProvider dense maxSnack={3}>
        <SWRConfig value={{ fetcher }}>
          <AuthProvider>
            <HeaderBar />
            {children}
          </AuthProvider>
        </SWRConfig>
      </SnackbarProvider>
    </ThemeProvider>
  );
};
