import { sendMailNodemailer } from "./provider/mail/nodemailer";

export const sendMail = async (
  to: string,
  subject: string,
  text?: string,
  html?: string,
): Promise<void> => {
  await sendMailNodemailer(to, subject, text, html);
};
