export type OpenLibraryWork = {
  title: string;
  author: string[];
  publication_year?: number;
  description?: string;
};

export type OpenLibraryEdition = {
  title: string;
  description?: string;
  cover?: number;
  format?: string;
  publisher?: string;
  page_count?: number;
  edition?: string;
  edition_year?: number;
  isbn: string;
  publication_year?: number;
};
