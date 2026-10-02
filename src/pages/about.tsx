import { Box, Divider, Link, Typography, useTheme } from "@mui/material";
import { APP_VERSION, LIBRARY_NAME } from "config/config";
import Head from "next/head";
import Image from "next/image";

export default function About() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>About - {LIBRARY_NAME}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            gap: 3,
            px: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            About
          </Typography>

          <Box
            sx={{
              width: "100%",
              maxWidth: 480,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Powered by
              </Typography>
              <Image
                src={
                  theme.palette.mode === "dark"
                    ? "/logo_text_dark.svg"
                    : "/logo_text.svg"
                }
                alt="Alkove Logo"
                width={225}
                height={68}
              />
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Library Name
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {LIBRARY_NAME}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {APP_VERSION}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Source
              </Typography>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                sx={{ fontWeight: "medium" }}
              >
                Coming soon
              </Link>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                License
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                GNU GPL v3
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
