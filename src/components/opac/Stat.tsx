import { Box, Typography } from "@mui/material";
import React from "react";

export const Stat: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => (
  <Box sx={{ minWidth: 90 }}>
    <Typography
      sx={{
        fontFamily: "var(--font-serif)",
        fontSize: { xs: 30, md: 40 },
        lineHeight: 1.1,
        color: "gold.main",
      }}
    >
      {value.toLocaleString()}
    </Typography>
    <Typography
      variant="overline"
      sx={{ color: "text.secondary", letterSpacing: "0.16em" }}
    >
      {label}
    </Typography>
  </Box>
);
