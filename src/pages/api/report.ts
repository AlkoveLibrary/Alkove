import { requestHandler } from "backend/request-handler";
import { logErrorInternal } from "util/log-error-internal";
import { reportErrorSchema } from "schema/report";
import { validateBody } from "util/validate-body";

export default requestHandler({
  post: async (req) => {
    const body = validateBody(req.body, reportErrorSchema);
    await logErrorInternal(req, body.error, body.url);
    return { success: true, message: "Error reported successfully" };
  },
});
