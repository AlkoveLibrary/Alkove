import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getAllBooks, getAllBooksWithTransactionCount } from "backend/book";
import { getAllTransactions } from "backend/transaction";
import {
  BooksPerInterval,
  BooksByGenre,
  BooksCheckedOutBreakdown,
  TransactionsByGenre,
  TransactionsByAuthor,
  TransactionsPerWeek,
  BooksByAuthor,
} from "types/book";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

const INTERVAL_YEARS = 5;
const NO_GENRE_LABEL = "No Genre";
const NO_AUTHOR_LABEL = "No Author";
const OTHER_AUTHOR_LABEL = "Other";
const MAX_AUTHOR_SLICES = 15;

const getWeekStart = (date: Date) => {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayOfWeek = weekStart.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  return weekStart.toISOString().slice(0, 10);
};

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed library statistics",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const booksWithYear = await getAllBooks({
      OR: [
        { edition_year: { not: null } },
        { publication_year: { not: null } },
      ],
    });

    const intervalCounts = new Map<number, number>();
    booksWithYear.forEach(({ edition_year, publication_year }) => {
      const year = edition_year ?? publication_year;
      if (year === null) return;
      const interval = Math.floor(year / INTERVAL_YEARS) * INTERVAL_YEARS;
      intervalCounts.set(interval, (intervalCounts.get(interval) ?? 0) + 1);
    });

    const booksPerInterval: BooksPerInterval = Array.from(
      intervalCounts.entries(),
    )
      .map(([interval, count]) => ({ interval, count }))
      .sort((a, b) => a.interval - b.interval);

    const allBooks = await getAllBooks();

    const genreCounts = new Map<string, number>();
    allBooks.forEach(({ genre }) => {
      const label = genre?.trim() || NO_GENRE_LABEL;
      genreCounts.set(label, (genreCounts.get(label) ?? 0) + 1);
    });

    const totalBooks = allBooks.length;
    const booksByGenre: BooksByGenre = Array.from(genreCounts.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage:
          totalBooks > 0 ? Math.round((count / totalBooks) * 1000) / 10 : 0,
      }))
      .sort((a, b) => a.genre.localeCompare(b.genre));

    const bookAuthorCounts = new Map<string, number>();
    allBooks.forEach(({ author }) => {
      const label = author?.trim() || NO_AUTHOR_LABEL;
      bookAuthorCounts.set(label, (bookAuthorCounts.get(label) ?? 0) + 1);
    });

    const multiBookAuthorCounts = Array.from(bookAuthorCounts.entries()).filter(
      ([, count]) => count >= 2,
    );
    const singleBookAuthorCount = Array.from(bookAuthorCounts.entries())
      .filter(([, count]) => count === 1)
      .reduce((sum, [, count]) => sum + count, 0);

    const bookAuthorEntries = [...multiBookAuthorCounts];
    if (singleBookAuthorCount > 0) {
      bookAuthorEntries.push([OTHER_AUTHOR_LABEL, singleBookAuthorCount]);
    }

    const booksByAuthor: BooksByAuthor = bookAuthorEntries
      .map(([author, count]) => ({
        author,
        count,
        percentage:
          totalBooks > 0 ? Math.round((count / totalBooks) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const booksWithTransactionCount = await getAllBooksWithTransactionCount();

    const checkedOutCount = booksWithTransactionCount.filter(
      (book) => book.transactionCount > 0,
    ).length;
    const neverCheckedOutCount =
      booksWithTransactionCount.length - checkedOutCount;
    const totalBooksForCheckout = booksWithTransactionCount.length;

    const booksCheckedOutBreakdown: BooksCheckedOutBreakdown = [
      { status: "Checked Out", count: checkedOutCount },
      { status: "Never Checked Out", count: neverCheckedOutCount },
    ].map((entry) => ({
      ...entry,
      percentage:
        totalBooksForCheckout > 0
          ? Math.round((entry.count / totalBooksForCheckout) * 1000) / 10
          : 0,
    }));

    const transactions = await getAllTransactions();
    const borrows = transactions.filter(
      (transaction) => transaction.checked_out_at,
    );

    const transactionGenreCounts = new Map<string, number>();
    borrows.forEach(({ copy }) => {
      const label = copy.book.genre?.trim() || NO_GENRE_LABEL;
      transactionGenreCounts.set(
        label,
        (transactionGenreCounts.get(label) ?? 0) + 1,
      );
    });

    const totalTransactions = borrows.length;
    const transactionsByGenre: TransactionsByGenre = Array.from(
      transactionGenreCounts.entries(),
    )
      .map(([genre, count]) => ({
        genre,
        count,
        percentage:
          totalTransactions > 0
            ? Math.round((count / totalTransactions) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => a.genre.localeCompare(b.genre));

    const transactionAuthorCounts = new Map<string, number>();
    borrows.forEach(({ copy }) => {
      const label = copy.book.author?.trim() || NO_AUTHOR_LABEL;
      transactionAuthorCounts.set(
        label,
        (transactionAuthorCounts.get(label) ?? 0) + 1,
      );
    });

    const sortedAuthorCounts = Array.from(
      transactionAuthorCounts.entries(),
    ).sort((a, b) => b[1] - a[1]);

    const topAuthorCounts = sortedAuthorCounts.slice(0, MAX_AUTHOR_SLICES);
    const otherAuthorCount = sortedAuthorCounts
      .slice(MAX_AUTHOR_SLICES)
      .reduce((sum, [, count]) => sum + count, 0);

    const authorEntries = [...topAuthorCounts];
    if (otherAuthorCount > 0) {
      authorEntries.push([OTHER_AUTHOR_LABEL, otherAuthorCount]);
    }

    const transactionsByAuthor: TransactionsByAuthor = authorEntries.map(
      ([author, count]) => ({
        author,
        count,
        percentage:
          totalTransactions > 0
            ? Math.round((count / totalTransactions) * 1000) / 10
            : 0,
      }),
    );

    const transactionWeekCounts = new Map<string, number>();
    transactions.forEach(({ created_at }) => {
      const week = getWeekStart(created_at);
      transactionWeekCounts.set(
        week,
        (transactionWeekCounts.get(week) ?? 0) + 1,
      );
    });

    const weekKeys = Array.from(transactionWeekCounts.keys()).sort();
    const transactionsPerWeek: TransactionsPerWeek = [];
    if (weekKeys.length > 0) {
      const cursor = new Date(weekKeys[0]);
      const lastWeek = new Date(weekKeys[weekKeys.length - 1]);
      while (cursor <= lastWeek) {
        const week = cursor.toISOString().slice(0, 10);
        transactionsPerWeek.push({
          week,
          count: transactionWeekCounts.get(week) ?? 0,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 7);
      }
    }

    return {
      booksPerInterval,
      booksWithYearCount: booksWithYear.length,
      booksByGenre,
      booksCheckedOutBreakdown,
      transactionsByGenre,
      transactionsByAuthor,
      transactionsPerWeek,
      booksByAuthor,
    };
  },
});
