import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { getBookCount } from "backend/book";
import { getCopyCount } from "backend/copy";
import { getAllTransactions } from "backend/transaction";
import { KpiData } from "types/book";
import { CHECKOUT_DURATION_DAYS } from "config/config";
import { getAllBookRequestsWithUser } from "backend/book-request";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed staff dashboard",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const bookRequests = await getAllBookRequestsWithUser({ archived: false });
    const books = await getBookCount();
    const copies = await getCopyCount({ archived: false });
    const transactions = await getAllTransactions();
    const booksCheckedOut = transactions.filter(
      (transaction) => transaction.checked_out_at && !transaction.checked_in_at,
    );
    const booksCheckedOutCount = booksCheckedOut.length;

    const booksOverdue = booksCheckedOut.filter((transaction) => {
      if (!transaction.checked_out_at) return false; // Shouldn't happen, but just in case
      const dueDate = new Date(transaction.checked_out_at);
      dueDate.setDate(dueDate.getDate() + CHECKOUT_DURATION_DAYS);
      return new Date() > dueDate;
    }).length;

    const activeHolds = transactions.filter(
      (transaction) =>
        transaction.held_at &&
        !transaction.hold_cancelled_at &&
        !transaction.checked_out_at,
    ).length;

    const booksReturned = transactions.filter(
      (transaction) => transaction.checked_in_at && transaction.checked_out_at,
    );

    const averageBorrowDuration =
      booksReturned

        .map((transaction) => {
          if (!transaction.checked_out_at || !transaction.checked_in_at)
            return 0; // Shouldn't happen, but just in case
          const checkedOutAt = new Date(transaction.checked_out_at);
          const checkedInAt = new Date(transaction.checked_in_at!);
          return (
            (checkedInAt.getTime() - checkedOutAt.getTime()) /
            (1000 * 60 * 60 * 24)
          ); // Duration in days
        })
        .reduce((acc, duration) => acc + duration, 0) / booksReturned.length ||
      0;

    const booksReturnedCount = booksReturned.length;

    return {
      books,
      copies,
      activeHolds,
      booksCheckedOutCount,
      booksReturnedCount,
      booksOverdue,
      averageBorrowDuration,
      bookRequests: bookRequests.length,
    } as KpiData;
  },
});
