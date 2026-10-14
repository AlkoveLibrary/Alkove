import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import {
  cancelHold,
  createHold,
  getActiveHoldByCopyId,
  getAllTransactions,
  getOpenTransactionByCopyId,
  getTransactionById,
} from "backend/transaction";
import { getCopyById } from "backend/copy";
import { getUserById } from "backend/user";
import { validateBody } from "util/validate-body";
import {
  cancelHoldSchema,
  createTransactionSchema,
} from "schema/transaction";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    await createEventLog({
      req,
      event: "Viewed holds",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
    });

    const holds = await getAllTransactions({
      held_at: { not: null },
      hold_cancelled_at: null,
      checked_out_at: null,
    });

    return { holds };
  },
  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { user_id, copy_id } = validateBody(
      req.body,
      createTransactionSchema,
    );

    const holder = await getUserById(user_id);
    if (!holder) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "User not found" });
    }

    const copy = await getCopyById(copy_id);
    if (!copy || copy.archived) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Copy not found" });
    }

    const openTransaction = await getOpenTransactionByCopyId(copy_id);
    if (openTransaction) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is checked out",
      });
    }

    const activeHold = await getActiveHoldByCopyId(copy_id);
    if (activeHold) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "This copy is already on hold",
      });
    }

    const transaction = await createHold(user_id, copy_id);

    await createEventLog({
      req,
      event: "Hold placed by staff",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id: transaction.transaction_id,
        copy_id,
        book_id: copy.book_id,
        holder_id: holder.user_id,
      },
    });

    return { message: "Hold placed", transaction };
  },
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const { transaction_id } = validateBody(req.body, cancelHoldSchema);

    const activeHold = await getTransactionById(transaction_id);
    if (
      !activeHold ||
      !activeHold.held_at ||
      activeHold.hold_cancelled_at ||
      activeHold.checked_out_at
    ) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Hold not found" });
    }

    const transaction = await cancelHold(activeHold.transaction_id);

    await createEventLog({
      req,
      event: "Hold cancelled by staff",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id: transaction.transaction_id,
        copy_id: transaction.copy_id,
        holder_id: transaction.user_id,
      },
    });

    return { message: "Hold cancelled", transaction };
  },
});
