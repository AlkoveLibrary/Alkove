import { createTheme } from "@mui/material/styles";

const baseColors = {
  ink: "#1a1a1a",
  gold: "#b5833a",
  paper: "#fffdf8",
  sand: "#f0ece4",
  text: "#4a4a4a",
  border: "#e0d9cc",
  goldDark: "#c9974a",
};

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,

      customGreen: {
        main: mode === "light" ? "#e6ffed" : "#001e02",
        contrastText: mode === "light" ? "#1b5e20" : "#e6ffed",
      },

      customRed: {
        main: mode === "light" ? "#facfcc" : "#250000",
        contrastText: mode === "light" ? "#b71c1c" : "#facfcc",
      },

      customYellow: {
        main: mode === "light" ? "#fff6c7" : "#262000",
        contrastText: mode === "light" ? "#7a5c00" : "#fff6c7",
      },

      gold: {
        main: mode === "light" ? baseColors.gold : baseColors.goldDark,
      },

      ...(mode === "light"
        ? {
            primary: { main: baseColors.ink },
            secondary: { main: baseColors.gold },
            background: {
              default: baseColors.sand,
              paper: baseColors.paper,
            },
            text: {
              primary: baseColors.ink,
              secondary: baseColors.text,
            },
            divider: baseColors.border,
          }
        : {
            primary: { main: baseColors.goldDark },
          }),
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
    },
    typography: {
      fontFamily: "var(--font-sans)",
      h1: { fontFamily: "var(--font-serif)", fontWeight: 400 },
      h2: { fontFamily: "var(--font-serif)", fontWeight: 400 },
      h3: { fontFamily: "var(--font-serif)", fontWeight: 400 },
      h4: {
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
      },
      h5: {
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
      },
      h6: {
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
      },
    },
  });
