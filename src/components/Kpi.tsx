import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Stack,
  IconButton,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import Link from "next/link";
import { PAGES } from "constants/pages";
import { KpiData } from "types/book";

interface KpiProps {
  data: KpiData;
}

const Kpi: React.FC<KpiProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "center", mb: 4 }}
    >
      <Card sx={{ flex: 1, maxWidth: 420, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography
            variant="subtitle1"
            sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 1 }}
          >
            Books
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.books}
              </Typography>
              <Typography variant="subtitle2">Books</Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.copies}
              </Typography>
              <Typography variant="subtitle2">Copies</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.activeHolds}
              </Typography>
              <Typography variant="subtitle2">Active Holds</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.bookRequests}
              </Typography>
              <Typography variant="subtitle2" color="text.colour">
                Requests
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1, maxWidth: 420, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", mb: 1 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}
            >
              Borrowed Books
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.secondary.main,
                ml: 1,
              }}
            >
              {data.booksCheckedOutCount}
            </Typography>
            <IconButton
              component={Link}
              href={PAGES.STAFF.BORROWED}
              size="small"
              sx={{ color: theme.palette.grey[700] }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "space-between", mt: 1 }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.booksOverdue}
              </Typography>
              <Typography variant="subtitle2" color="text.colour">
                Overdue
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.averageBorrowDuration.toFixed(1)}
              </Typography>
              <Typography variant="subtitle2" color="text.colour">
                Average Borrow (days)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
              >
                {data.booksReturnedCount}
              </Typography>
              <Typography variant="subtitle2" color="text.colour">
                Total Returns
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Kpi;
