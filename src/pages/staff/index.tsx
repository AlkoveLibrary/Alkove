import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { PAGES } from "constants/pages";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

import Kpi from "components/Kpi";
import useSWR from "swr";
import { KpiData } from "types/book";

export default function Home() {
  const router = useRouter();

  const { data, error, isLoading } = useSWR<KpiData>("staff/dashboard");

  return (
    <>
      <Head>
        <title>Staff Dashboard - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ pt: 4, px: 4, pb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
            {LIBRARY_NAME} Staff Dashboard
          </Typography>
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
            <Typography color="error">
              Failed to load dashboard data.
            </Typography>
          ) : data ? (
            <Kpi data={data} />
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            gap: 2,
            pb: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{ width: 240 }}
            onClick={() =>
              router.push(`${PAGES.STAFF.TRANSACTIONS.HOME}?type=checkin`)
            }
          >
            Check In
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ width: 240 }}
            onClick={() =>
              router.push(`${PAGES.STAFF.TRANSACTIONS.HOME}?type=checkout`)
            }
          >
            Check Out
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(PAGES.STAFF.BOOKS.HOME)}
          >
            Book Catalog
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(PAGES.STAFF.USERS.HOME)}
          >
            Users
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(PAGES.STAFF.HOLDS)}
          >
            Holds
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(`${PAGES.STAFF.BOOK_REQUESTS}`)}
          >
            Book Requests
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(`${PAGES.STAFF.STATS}`)}
          >
            Book Statistics
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ width: 240 }}
            onClick={() => router.push(`${PAGES.STAFF.USER_MANUAL}`)}
          >
            User Manual
          </Button>
        </Box>
      </Box>
    </>
  );
}
