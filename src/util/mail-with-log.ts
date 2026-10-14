import { createMailLog, updateMailLog } from "backend/mail-log";
import { NextApiRequest } from "next";
import { logErrorInternal } from "./log-error-internal";
import { sendMail } from "backend/mail";

const redactSecrets = (body: string, secrets: string[]) =>
  secrets.reduce(
    (redacted, secret) =>
      secret ? redacted.replaceAll(secret, "[REDACTED]") : redacted,
    body,
  );

export const sendMailWithLog = async (
  req: NextApiRequest,
  to: string,
  subject: string,
  text?: string,
  html?: string,
  secrets: string[] = [],
): Promise<void> => {
  let mailLogId: string | null = null;
  try {
    const response = await createMailLog(
      to,
      subject,
      redactSecrets((text ?? "") + (html ?? ""), secrets),
    );
    mailLogId = response.mail_log_id;
  } catch (error) {
    await logErrorInternal(req, error);
  }
  sendMail(to, subject, text, html).then(
    async () => {
      if (mailLogId) {
        await updateMailLog(mailLogId, undefined, true);
      }
    },
    async (error) => {
      await logErrorInternal(req, error);
      if (mailLogId) {
        await updateMailLog(
          mailLogId,
          error instanceof Error ? error.message : String(error),
          false,
        );
      }
    },
  );
};
