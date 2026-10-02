import { requestHandler } from "backend/request-handler";

import { getAllBooksWithTransactionCount } from "backend/book";
import { OpacHomepage } from "types/book";
import { POPULAR_BOOK_COUNT } from "config/config";
import { NEW_ARRIVALS_COUNT, NEW_ARRIVALS_MAX_AGE_DAYS } from "config/config";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  get: async (req) => {
    await createEventLog({
      req,
      event: "Homepage book list viewed",
      type: "opac",
      action: EventAction.read,
    });

    const books = await getAllBooksWithTransactionCount();

    const newArrivalsCutoff = new Date(
      Date.now() - NEW_ARRIVALS_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    );

    const newArrivals = [...books]
      .filter((book) => book.created_at >= newArrivalsCutoff)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, NEW_ARRIVALS_COUNT);

    const featuredBooks = books.filter((book) => book.featured);

    const popularBooks = [...books]
      .filter((book) => book.transactionCount > 0)
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, POPULAR_BOOK_COUNT);

    return {
      message: "Books fetched",
      books,
      newArrivals,
      featuredBooks,
      popularBooks,
    } as OpacHomepage;
  },
});
