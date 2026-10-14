import { Prisma } from "@prisma/client";
import { BOOKS } from "./books";

const mockingbirdId = BOOKS.find(
  (b) => b.title === "To Kill a Mockingbird",
)!.book_id;

export const COPIES: Prisma.CopyCreateManyInput[] = [
  {
    copy_id: "B1000000-0000-0000-0000-000000000001",
    book_id: mockingbirdId,
    condition: "Good",
    location: "Shelf A1",
  },
  {
    copy_id: "B1000000-0000-0000-0000-000000000002",
    book_id: mockingbirdId,
    condition: "Fair",
    location: "Shelf A1",
    notes: "Minor wear on cover",
  },
  {
    copy_id: "B1000000-0000-0000-0000-000000000003",
    book_id: mockingbirdId,
    condition: "Excellent",
    location: "Shelf B3",
  },
];
