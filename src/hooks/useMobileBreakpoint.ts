import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export function useMobileBreakpoint() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
