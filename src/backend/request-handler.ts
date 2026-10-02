import { ErrorType } from "constants/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { logErrorExternal } from "./log-error-external";
import { logErrorInternal } from "util/log-error-internal";

type NextRequest = (
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) => Promise<unknown> | void;

type RequestHandler = {
  post?: NextRequest;
  get?: NextRequest;
  put?: NextRequest;
  delete?: NextRequest;
  patch?: NextRequest;
};
export const requestHandler =
  (handler: RequestHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    if (!method) {
      res.status(405).json({ message: "No method supplied" });
      return;
    }

    const handlerMap = method.toLowerCase() as keyof RequestHandler;

    if (handler[handlerMap]) {
      try {
        const result = await handler[handlerMap](req, res);
        if (result) {
          return res.status(200).json(result);
        }
        return res.status(200).end();
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === ErrorType.BAD_REQUEST) {
            return res.status(400).json({ message: e.cause ?? "Bad Request" });
          } else if (e.message === ErrorType.UNAUTHORIZED) {
            return res.status(401).json({ message: e.cause ?? "Unauthorized" });
          } else if (e.message === ErrorType.FORBIDDEN) {
            return res.status(403).json({ message: e.cause ?? "Forbidden" });
          } else if (e.message === ErrorType.NOT_FOUND) {
            return res.status(404).json({ message: e.cause ?? "Not Found" });
          } else if (e.message === ErrorType.CONFLICT) {
            return res.status(409).json({ message: e.cause ?? "Conflict" });
          } else if (e.message === ErrorType.TOO_MANY_REQUESTS) {
            return res.status(429).json({
              message: e.cause ?? "Too many requests",
            });
          } else {
            logErrorExternal(req, e);
            await logErrorInternal(req, e);
            return res.status(500).json({ message: "Internal Server Error" });
          }
        } else {
          logErrorExternal(req, e);
          await logErrorInternal(req, e);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    }
    return res.status(405).json({ message: "Method Not Allowed" });
  };
