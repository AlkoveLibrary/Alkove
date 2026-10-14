import { OpenLibraryEdition, OpenLibraryWork } from "types/openlibrary";
import { getImage } from "util/get-image";
import axios from "axios";
import { ErrorType } from "constants/errors";

const openlibraryHeaders = {
  "User-Agent": process.env.OPENLIBRARY_USER_AGENT || "",
  Accept: "application/json",
};

export async function fetchOpenLibraryCoverBuffer(
  coverId: string | number,
  size: "S" | "M" | "L" = "L",
) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;
  const imageFile = await getImage(url, openlibraryHeaders);
  return imageFile;
}

export async function searchBooks(isbn: string) {
  if (!isbn) {
    throw new Error(ErrorType.BAD_REQUEST, { cause: "ISBN is required" });
  }

  const editionUrl = `https://openlibrary.org/isbn/${isbn}.json`;
  let ed;
  try {
    const resp = await axios.get(editionUrl, { headers: openlibraryHeaders });
    ed = resp.data;
  } catch (err) {
    const error = err as { response?: { status: number }; message?: string };
    if (error.response && error.response.status === 404) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Edition not found" });
    }

    throw new Error(ErrorType.INTERNAL_SERVER_ERROR, {
      cause: error.message || "Failed to fetch edition",
    });
  }

  const year = ed.publish_date
    ? parseInt(ed.publish_date.match(/\d{4}/)?.[0] || "")
    : undefined;
  const edition: OpenLibraryEdition = {
    title: ed.title,
    description: ed.description
      ? typeof ed.description === "string"
        ? ed.description
        : ed.description.value
      : undefined,
    publication_year: year,
    edition_year: year,
    cover: ed.covers && ed.covers.length > 0 ? ed.covers[0] : undefined,
    format: ed.physical_format,
    publisher: Array.isArray(ed.publishers)
      ? ed.publishers.join(", ")
      : ed.publishers,
    page_count: ed.number_of_pages,
    edition: ed.edition_name,
    isbn,
  };

  // Try to fetch work data if available
  let work: OpenLibraryWork | null = null;
  if (
    ed.works &&
    Array.isArray(ed.works) &&
    ed.works.length > 0 &&
    ed.works[0].key
  ) {
    const workKey = ed.works[0].key;
    const workUrl = `https://openlibrary.org${workKey}.json`;
    try {
      const workResp = await axios.get(workUrl, {
        headers: openlibraryHeaders,
      });
      const workData = workResp.data;
      const publication_year = workData.first_publish_date
        ? parseInt(workData.first_publish_date.match(/\d{4}/)?.[0] || "")
        : undefined;
      if (publication_year) {
        edition.publication_year = publication_year;
      }
      type OpenLibraryWorkAuthorRef = { author: { key: string } };
      work = {
        title: workData.title,
        author: Array.isArray(workData.authors)
          ? await Promise.all(
              (workData.authors as OpenLibraryWorkAuthorRef[]).map(
                async (a) => {
                  if (a.author && a.author.key) {
                    try {
                      const authorResp = await axios.get(
                        `https://openlibrary.org${a.author.key}.json`,
                        { headers: openlibraryHeaders },
                      );
                      return authorResp.data.name;
                    } catch {
                      return "";
                    }
                  }
                  return "";
                },
              ),
            )
          : [],
        publication_year,
        description: workData.description
          ? typeof workData.description === "string"
            ? workData.description
            : workData.description?.value
          : undefined,
      };
    } catch {
      // If work fetch fails, just skip work details
    }
  }

  return { work, edition };
}
