import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { ErrorType } from "constants/errors";
import { getTransactionById, checkInTransaction } from "backend/transaction";
import { getBookByCopyId } from "backend/book";
import { sendMailWithLog } from "util/mail-with-log";
import { CHECK_IN_EMAIL_SUBJECT, CHECK_IN_EMAIL_TEMPLATE } from "config/config";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { transaction_id } = req.query as { transaction_id: string };

    await createEventLog({
      req,
      event: "Transaction details viewed",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: { transaction_id },
    });

    const transaction = await getTransactionById(transaction_id);
    return { transaction };
  },
  patch: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { transaction_id } = req.query as { transaction_id: string };

    const existingTransaction = await getTransactionById(transaction_id);
    if (!existingTransaction) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Transaction not found" });
    }

    if (!existingTransaction.checked_out_at) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is not checked out",
      });
    }

    if (existingTransaction.checked_in_at) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is already checked in",
      });
    }

    const transaction = await checkInTransaction(transaction_id);
    const copy_id = transaction.copy_id;
    const book = await getBookByCopyId(copy_id);
    if (!book) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Copy not found" });
    }

    await createEventLog({
      req,
      event: "Book checked in",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id,
        copy_id,
        book_id: book.book_id,
        borrower_id: transaction.user_id,
      },
    });

    const checkoutDate =
      transaction.checked_out_at?.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }) ?? "Unknown";

    const checkinDate = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (transaction.user.email) {
      const html = CHECK_IN_EMAIL_TEMPLATE(
        book.title,
        checkoutDate,
        checkinDate,
        book.author || undefined,
      );

      // Fire and forget the email sending, but log any errors internally
      sendMailWithLog(
        req,
        transaction.user.email,
        CHECK_IN_EMAIL_SUBJECT,
        undefined,
        html,
      );
    }

    return { transaction };
  },
});
