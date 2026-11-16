export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export type ExportField = { key: string; label: string };

export const BOOK_EXPORT_FIELDS = [
  { key: "book_id", label: "Book ID" },
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "author", label: "Author" },
  { key: "isbn", label: "ISBN" },
  { key: "publication_year", label: "Publication Year" },
  { key: "edition", label: "Edition" },
  { key: "edition_year", label: "Edition Year" },
  { key: "publisher", label: "Publisher" },
  { key: "format", label: "Format" },
  { key: "category", label: "Category" },
  { key: "genre", label: "Genre" },
  { key: "page_count", label: "Page Count" },
  { key: "dewey_decimal", label: "Dewey Decimal" },
  { key: "description", label: "Description" },
  { key: "featured", label: "Featured" },
  { key: "copy_count", label: "Copy Count" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
] as const satisfies readonly ExportField[];

export const USER_EXPORT_FIELDS = [
  { key: "user_id", label: "User ID" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "last_login", label: "Last Login" },
  { key: "last_activity", label: "Last Activity" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
] as const satisfies readonly ExportField[];

export type BookExportFieldKey = (typeof BOOK_EXPORT_FIELDS)[number]["key"];
export type UserExportFieldKey = (typeof USER_EXPORT_FIELDS)[number]["key"];
