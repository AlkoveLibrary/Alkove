import Image from "next/image";
import { FC, useState } from "react";
import { Box, Card } from "@mui/material";
import ViewFullCoverDialog from "./CoverDialog";
import { useMobileBreakpoint } from "hooks/useMobileBreakpoint";

export const CoverFull: FC<{
  coverId?: string | null;
  openLibraryId?: number;
}> = ({ coverId, openLibraryId }) => {
  const [open, setOpen] = useState(false);

  const isMobile = useMobileBreakpoint();

  if (!coverId && !openLibraryId) {
    return (
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          my: 2,
          borderRadius: 4,
          boxShadow: 6,
          overflow: "hidden",
          p: 0,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 500,
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Image
            src="/book.svg"
            alt="No cover available"
            width={132}
            height={122}
            style={{ width: 180, height: "auto", opacity: 0.6 }}
          />
        </Box>
      </Card>
    );
  }
  const url = coverId
    ? "/api/covers/" + coverId
    : "/api/covers/openlibrary/" + openLibraryId;

  return (
    <>
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          my: 2,
          borderRadius: 4,
          boxShadow: 6,
          overflow: "hidden",
          p: 0,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: isMobile ? "default" : "pointer",
        }}
        onClick={() => (isMobile ? null : setOpen(true))}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 500,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Image
            src={url}
            alt="Book Cover"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              objectPosition: "top",
              display: "block",
            }}
            sizes="(max-width: 500px) 100vw, 500px"
            fill={false}
            width={500}
            height={700}
            unoptimized={!coverId}
          />
        </div>
      </Card>
      <ViewFullCoverDialog
        open={open}
        handleClose={() => setOpen(false)}
        url={url}
      />
    </>
  );
};
