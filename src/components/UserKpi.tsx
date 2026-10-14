import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Stack,
} from "@mui/material";
import { UserKpiData } from "types/user";

interface UserKpiProps {
  data: UserKpiData;
}

const UserKpi: React.FC<UserKpiProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}
          >
            Users
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: theme.palette.secondary.main,
              ml: 2,
            }}
          >
            {data.userCount}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", mt: 2 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
            >
              {data.baseUserCount}
            </Typography>
            <Typography variant="body1" color="text.colour">
              Local Users
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
            >
              {data.webUserCount}
            </Typography>
            <Typography variant="body1" color="text.colour">
              Web Users
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
            >
              {data.staffUserCount}
            </Typography>
            <Typography variant="body1" color="text.colour">
              Staff
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
            >
              {data.adminUserCount}
            </Typography>
            <Typography variant="body1" color="text.colour">
              Admins
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserKpi;
