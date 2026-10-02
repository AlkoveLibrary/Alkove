import { logErrorConsole } from "./provider/error-log/console";
import { NextApiRequest } from "next";

export const logErrorExternal = (req: NextApiRequest, error: unknown) => {
  logErrorConsole(req, error);
};
