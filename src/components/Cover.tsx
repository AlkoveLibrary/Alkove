import Image from "next/image";
import { FC } from "react";

export const Cover: FC<{ coverId: string }> = ({ coverId }) => {
  const url = "/api/covers/" + coverId;
  return (
    <Image
      src={url}
      alt="Book Cover"
      fill
      style={{ objectFit: "cover", objectPosition: "top" }}
    />
  );
};
