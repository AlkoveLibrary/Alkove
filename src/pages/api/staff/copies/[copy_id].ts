import { requestHandler } from "backend/request-handler";
import { authenticateUser } from "backend/authenticate-user";
import { validateRole } from "util/validate-role";
import { STAFF } from "constants/roles";
import { archiveCopy, deleteCopy, editCopy, getCopyById } from "backend/copy";
import { validateBody } from "util/validate-body";
import { editCopySchema } from "schema/copy";
import { ErrorType } from "constants/errors";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  get: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const copy_id = req.query.copy_id;

    if (!copy_id || typeof copy_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "copy_id is required and must be a string",
      });
    }

    await createEventLog({
      req,
      event: "Copy details viewed",
      type: "staff",
      action: EventAction.read,
      user_id: user.user_id,
      data: { copy_id },
    });

    const copy = await getCopyById(copy_id);
    return { copy };
  },

  post: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const copy_id = req.query.copy_id;

    if (!copy_id || typeof copy_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "copy_id is required and must be a string",
      });
    }

    const body = validateBody(req.body, editCopySchema);

    await createEventLog({
      req,
      event: "Copy details edited",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: {
        copy_id,
        notes: body.notes,
        condition: body.condition,
        location: body.location,
      },
    });

    const copy = await editCopy({
      copy_id,
      notes: body.notes,
      condition: body.condition,
      location: body.location,
    });
    return { message: "Edited copy", copy };
  },
  delete: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const copy_id = req.query.copy_id;

    if (!copy_id || typeof copy_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "copy_id is required and must be a string",
      });
    }

    const copy = await getCopyById(copy_id);

    if (!copy) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Copy not found" });
    }
    if (copy.Transaction.length > 0) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "Can't delete copy with transactions",
      });
    }

    await deleteCopy(copy_id);

    await createEventLog({
      req,
      event: "Copy deleted",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { copy_id, book_id: copy.book_id },
    });

    return { message: "Deleted copy" };
  },

  patch: async (req) => {
    const user = await authenticateUser(req);
    validateRole(user, STAFF);

    const copy_id = req.query.copy_id;

    if (!copy_id || typeof copy_id !== "string") {
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: "copy_id is required and must be a string",
      });
    }

    const copy = await getCopyById(copy_id);

    if (!copy) {
      throw new Error(ErrorType.NOT_FOUND, { cause: "Copy not found" });
    }
    if (
      copy.Transaction.filter(
        (transaction) =>
          transaction.checked_out_at !== null &&
          transaction.checked_in_at === null,
      ).length > 0
    ) {
      throw new Error(ErrorType.CONFLICT, {
        cause: "Can't archive copy with active transactions",
      });
    }

    const editedCopy = await archiveCopy({
      copy_id,
      archived: !copy.archived,
    });

    await createEventLog({
      req,
      event: "Copy archive status toggled",
      type: "staff",
      action: EventAction.write,
      user_id: user.user_id,
      data: { copy_id, old: copy.archived, new: editedCopy.archived },
    });

    return { message: "Toggled archive status", copy: editedCopy };
  },
});
