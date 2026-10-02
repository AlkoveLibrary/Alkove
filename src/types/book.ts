import { Book, BookRequest, Copy, Cover, Transaction } from "@prisma/client";

export type BookWithCopies = Book & {
  description?: string;
  Copy: CopyWithAvailibility[];
};

export type BookWithCopiesStaff = Book & {
  description?: string;
  Copy: CopyWithExtras[];
};

export type CopyWithAvailibility = Pick<
  Copy,
  | "copy_id"
  | "location"
  | "condition"
  | "notes"
  | "created_at"
  | "updated_at"
  | "archived"
> & {
  available: boolean;
  held: boolean;
  held_by_self: boolean;
};

export type CopyWithExtras = Pick<
  Copy,
  | "copy_id"
  | "location"
  | "condition"
  | "notes"
  | "created_at"
  | "updated_at"
  | "archived"
> & {
  available: boolean;
  held: boolean;
  has_transactions: boolean;
};

export type BooksWithHistory = (Book & {
  Copy: (Copy & { Transaction: Transaction[] })[];
})[];

export type BookWithCount = Book & { count: number; availableCount: number };

export type BookWithCountOpac = Pick<
  BookWithCount,
  | "book_id"
  | "title"
  | "author"
  | "count"
  | "availableCount"
  | "edition_year"
  | "genre"
>;

export type OpacHomepage = {
  newArrivals: Book[];
  books: Book[];
  featuredBooks: Book[];
  popularBooks: Book[];
  message: string;
};

export interface KpiData {
  books: number;
  copies: number;
  activeHolds: number;
  booksCheckedOutCount: number;
  booksOverdue: number;
  averageBorrowDuration: number;
  booksReturnedCount: number;
  bookRequests: number;
}

export type BookResult = Book & {
  count: number;
  availableCount: number;
  heldCount: number;
};

export type BookWithCover = Book & { cover: Cover | null };

export type CreateBookRequestParams = {
  title: string;
  author: string;
  notes?: string;
};

export type CreateCopyParams = {
  location?: string;
  condition?: string;
  notes?: string;
};

export type CreateBookParams = {
  title: string;
  author?: string;
  isbn?: string | null;
  publication_year?: number | null;
  cover_id?: string;
  format?: string;
  publisher?: string;
  page_count?: number | null;
  edition?: string;
  dewey_decimal?: string;
  edition_year?: number | null;
  description?: string;
  genre?: string;
  copies: CreateCopyParams[];
};

export type EditBookParams = Omit<CreateBookParams, "copies">;

export type BookFormValues = CreateBookParams & { no_isbn?: boolean };

export type BooksPerInterval = {
  interval: number;
  count: number;
}[];

export type BooksByGenre = {
  genre: string;
  count: number;
  percentage: number;
}[];

export type BooksCheckedOutBreakdown = {
  status: string;
  count: number;
  percentage: number;
}[];

export type TransactionsByGenre = {
  genre: string;
  count: number;
  percentage: number;
}[];

export type TransactionsByAuthor = {
  author: string;
  count: number;
  percentage: number;
}[];

export type BooksByAuthor = {
  author: string;
  count: number;
  percentage: number;
}[];

export type TransactionsPerWeek = {
  week: string;
  count: number;
}[];

export type BookRequestWithUser = BookRequest & {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};
