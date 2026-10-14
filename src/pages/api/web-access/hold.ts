import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateBody } from "util/validate-body";
import { createHoldSchema } from "schema/transaction";
import { getCopyById } from "backend/copy";
import {
  cancelHold,
  createHold,
  getActiveHoldByCopyId,
  getOpenTransactionByCopyId,
} from "backend/transaction";
import { ErrorType } from "constants/errors";
import { EventAction } from "@prisma/client";
import { createEventLog } from "util/create-event-log";

export default requestHandler({
  post: async (req) => {
    const user = await authenticateUser(req);

    const { copy_id } = validateBody(req.body, createHoldSchema);

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

    const transaction = await createHold(user.user_id, copy_id);

    await createEventLog({
      req,
      event: "Hold placed",
      type: "web-access",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id: transaction.transaction_id,
        copy_id,
        book_id: copy.book_id,
      },
    });

    return { message: "Hold placed", transaction };
  },
  delete: async (req) => {
    const user = await authenticateUser(req);

    const { copy_id } = validateBody(req.body, createHoldSchema);

    const activeHold = await getActiveHoldByCopyId(copy_id);
    if (!activeHold || activeHold.user_id !== user.user_id) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Hold not found" });
    }

    const transaction = await cancelHold(activeHold.transaction_id);

    await createEventLog({
      req,
      event: "Hold cancelled",
      type: "web-access",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        transaction_id: transaction.transaction_id,
        copy_id,
      },
    });

    return { message: "Hold cancelled", transaction };
  },
});
