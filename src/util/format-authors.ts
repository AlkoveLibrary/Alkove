export const cleanAuthors = (authors?: string[] | null) =>
  Array.from(
    new Set((authors ?? []).map((author) => author.trim()).filter(Boolean)),
  );

export const formatAuthors = (authors?: string[] | null) =>
  cleanAuthors(authors).join(", ");
