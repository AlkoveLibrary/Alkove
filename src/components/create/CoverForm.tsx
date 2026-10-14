import React from "react";
import { Box, Button, Card, Typography } from "@mui/material";

import { CoverSmall } from "./CoverSmall";
import CreateCoverDialog from "components/CreateCoverDialog";
import { createStandaloneCoverRequest } from "requests/cover";
import useSWR from "swr";
import { Cover } from "@prisma/client";

interface CreateBookFormProps {
  coverId: string | undefined;
  handleSetCover: (coverId: string) => void;
  openLibraryCoverId?: number;
}

export default function CoverForm({
  coverId,
  handleSetCover,
  openLibraryCoverId,
}: CreateBookFormProps) {
  const [coverDialogOpen, setCoverDialogOpen] = React.useState(false);
  const { data: openLibraryCoverData } = useSWR<{ cover: Cover }>(
    openLibraryCoverId
      ? `staff/covers/openlibrary/${openLibraryCoverId}`
      : null,
  );

  // Set cover to openLibrary cover_id on initial load if available
  React.useEffect(() => {
    if (openLibraryCoverData && openLibraryCoverData.cover && !coverId) {
      handleSetCover(openLibraryCoverData.cover.cover_id);
    }
    // Only run on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openLibraryCoverData]);

  const handleUseOpenLibraryCover = () => {
    if (openLibraryCoverData) {
      handleSetCover(openLibraryCoverData.cover.cover_id);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
        Cover Image
      </Typography>
      <Card variant="outlined" sx={{ p: 2, width: "100%" }}>
        <Box sx={{ pb: 2 }}>
          <CoverSmall coverId={coverId} />
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {openLibraryCoverData && !coverId && (
            <Button onClick={handleUseOpenLibraryCover} variant="outlined">
              Use OpenLibrary Cover
            </Button>
          )}
          {coverId ? (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleSetCover("")}
            >
              Remove Cover
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => setCoverDialogOpen(true)}>
              Choose file for cover
            </Button>
          )}
        </Box>
        <CreateCoverDialog
          open={coverDialogOpen}
          onClose={() => setCoverDialogOpen(false)}
          onSubmit={async (file) => {
            const { cover_id } = await createStandaloneCoverRequest(file);
            handleSetCover(cover_id);
            setCoverDialogOpen(false);
          }}
        />
      </Card>
    </Box>
  );
}
