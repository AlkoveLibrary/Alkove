import ViewFullCoverDialog from "components/CoverDialog";
import Image from "next/image";
import { FC, useState } from "react";

export const CoverSmall: FC<{
  coverId?: string;
  openLibraryId?: number;
}> = ({ coverId, openLibraryId }) => {
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  if (!coverId && !openLibraryId) {
    return null;
  }

  const url = coverId
    ? "/api/covers/" + coverId
    : "/api/covers/openlibrary/" + openLibraryId;

  return (
    <>
      <ViewFullCoverDialog
        open={coverDialogOpen}
        handleClose={() => setCoverDialogOpen(false)}
        url={url}
      />
      <div
        style={{
          position: "relative",
          height: 200,
          maxHeight: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setCoverDialogOpen(true)}
      >
        <Image
          src={url}
          alt="Book Cover"
          style={{
            width: "auto",
            height: "200px",
            minHeight: "200px",
            maxHeight: "200px",
            objectFit: "contain",
            objectPosition: "top",
            display: "block",
          }}
          sizes="(max-width: 500px) 100vw, 500px"
          fill={false}
          width={300}
          height={500}
          unoptimized={!coverId}
        />
      </div>
    </>
  );
};
