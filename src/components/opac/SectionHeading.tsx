import { Box, Chip, Typography } from "@mui/material";
import React from "react";

export const SectionHeading: React.FC<{
  title: string;
  count: number;
}> = ({ title, count }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="h4" sx={{ whiteSpace: "nowrap" }}>
        {title}
      </Typography>
      <Chip label={count} sx={{ fontSize: 16 }} />
      <Box
        sx={{
          flexGrow: 1,
          height: "1px",
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.divider}, transparent)`,
        }}
      />
    </Box>
  </Box>
);
