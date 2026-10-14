import { Palette, PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    customGreen: Palette["primary"];
    customRed: Palette["primary"];
    customYellow: Palette["primary"];
    gold: { main: string };
  }
  interface PaletteOptions {
    customGreen?: PaletteOptions["primary"];
    customRed?: PaletteOptions["primary"];
    customYellow?: PaletteOptions["primary"];
    gold?: { main: string };
  }
}
