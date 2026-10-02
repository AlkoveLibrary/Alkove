import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { ErrorType } from "constants/errors";
import {
  getAllTransactions,
  createTransaction,
  getOpenTransactionByCopyId,
  getActiveHoldByCopyId,
  checkoutHold,
} from "backend/transaction";
import { getUserById, searchUsers } from "backend/user";
import { getBookByCopyId } from "backend/book";
import { sendMailWithLog } from "util/mail-with-log";
import {
  CHECK_OUT_EMAIL_SUBJECT,
  CHECK_OUT_EMAIL_TEMPLATE,
} from "config/config";
import { createTransactionSchema } from "schema/transaction";
import { validateBody } from "util/validate-body";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { q } = req.query as { q?: string };
    if (q) {
      await createEventLog({
        req,
        event: "Searched users for checkout",
        type: "staff",
        action: EventAction.read,
        user_id: user.user_id,
        data: { q },
      });

      const users = await searchUsers(q);
      return { users };
    }

    await createEventLog({
      req,
      event: "Viewed transactions",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const transactions = await getAllTransactions();
    return { transactions };
  },
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { user_id, copy_id } = validateBody(
      req.body,
      createTransactionSchema,
    );

    const existingUser = await getUserById(user_id);
    if (!existingUser) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }

    const book = await getBookByCopyId(copy_id);
    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Copy not found" });
    }

    const openTransaction = await getOpenTransactionByCopyId(copy_id);
    if (openTransaction) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is already checked out",
      });
    }

    const activeHold = await getActiveHoldByCopyId(copy_id);
    if (activeHold && activeHold.user_id !== user_id) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is on hold for another user",
      });
    }

    const transaction = activeHold
      ? await checkoutHold(activeHold.transaction_id)
      : await createTransaction(user_id, copy_id);

    await createEventLog({
      req,
      event: "Book checked out",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id: transaction.transaction_id,
        copy_id,
        book_id: book.book_id,
        borrower_id: existingUser.user_id,
      },
    });

    // Use the current date for the checkout date in the email
    const checkoutDate = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (existingUser.email) {
      const html = CHECK_OUT_EMAIL_TEMPLATE(
        book.title,
        checkoutDate,
        book.author || undefined,
      );

      // Fire and forget the email sending, but log any errors internally
      sendMailWithLog(
        req,
        existingUser.email,
        CHECK_OUT_EMAIL_SUBJECT,
        undefined,
        html,
      );
    }

    return { transaction: { ...transaction, checkoutDate } };
  },
});
