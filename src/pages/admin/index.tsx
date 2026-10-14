import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { PAGES } from "constants/pages";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";
import useSWR from "swr";
import { UserKpiData } from "types/user";
import UserKpi from "components/UserKpi";

export default function Home() {
  const router = useRouter();

  const { data, error, isLoading } = useSWR<UserKpiData>("admin/dashboard");

  return (
    <>
      <Head>
        <title>Admin Dashboard - {LIBRARY_NAME}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
          {LIBRARY_NAME} Admin Dashboard
        </Typography>
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 120,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">Failed to load user stats.</Typography>
          ) : data ? (
            <UserKpi data={data} />
          ) : null}
        </Box>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.BOOKS.HOME)}
        >
          Book Catalog
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.USERS.HOME)}
        >
          Users
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.ERROR_LOGS)}
        >
          Error Logs
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.AUTH_LOGS)}
        >
          Auth Logs
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.TRANSACTIONS)}
        >
          Transactions
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.MAIL_LOGS)}
        >
          Mail Logs
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.ADMIN.EVENT_LOGS)}
        >
          Event Logs
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: 240 }}
          onClick={() => router.push(PAGES.STAFF.HOME)}
        >
          Staff Dashboard
        </Button>
      </Box>
    </>
  );
}
