import { ROLE_IDS } from "constants/roles";

export const MANDATORY_MFA_ROLES = [ROLE_IDS.ADMIN];
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const SHOW_FEATURED_BOOKS = true;
export const SHOW_POPULAR_BOOKS = true;
export const SHOW_NEW_ARRIVALS = true;

export const POPULAR_BOOK_COUNT = 20;
export const NEW_ARRIVALS_COUNT = 20;
export const NEW_ARRIVALS_MAX_AGE_DAYS = 60;

export const CHECKOUT_DURATION_DAYS = 30;

export const LIBRARY_NAME = process.env.NEXT_PUBLIC_LIBRARY_NAME || "Alkove";

export const LIBRARY_TAGLINE = "";

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "unknown";

export const CHECK_IN_EMAIL_SUBJECT =
  "Book Check-in Confirmation - " + LIBRARY_NAME;
export const CHECK_OUT_EMAIL_SUBJECT =
  "Book Checkout Confirmation - " + LIBRARY_NAME;

const emailStyle = `<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #1a1a1a;
      padding: 48px 16px;
    }

    .email-wrapper {
      max-width: 560px;
      margin: 0 auto;
    }

    .email-card {
      background: #fffdf8;
      border: 1px solid #e0d9cc;
      border-radius: 4px;
      overflow: hidden;
    }

    .email-header {
      background: #1a1a1a;
      padding: 40px 48px 36px;
    }

    .app-name {
      font-family: 'DM Serif Display', serif;
      font-size: 36px;
      color: #f5f0e8;
      letter-spacing: 0.01em;
    }

    .email-body {
      padding: 48px;
    }

    .headline {
      font-family: 'DM Serif Display', serif;
      font-size: 32px;
      line-height: 1.25;
      color: #1a1a1a;
      margin-bottom: 20px;
    }

    .headline span {
      color: #b5833a;
    }

    .body-text {
      font-size: 15px;
      line-height: 1.7;
      color: #4a4a4a;
      margin-bottom: 16px;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }

    .details-table td {
      padding: 12px 0;
      border-bottom: 1px solid #e0d9cc;
      font-size: 14px;
    }

    .details-label {
      font-weight: 500;
      color: #666;
      width: 35%;
    }

    .details-value {
      color: #1a1a1a;
    }

    .divider {
      border: none;
      border-top: 1px solid #e0d9cc;
      margin: 32px 0;
    }

    .email-footer {
      padding: 24px 48px;
      border-top: 1px solid #e0d9cc;
      background: #f7f3ec;
    }

    .footer-text {
      font-size: 12px;
      color: #999;
      line-height: 1.6;
    }

    .cta-button {
      display: inline-block;
      background: #1a1a1a;
      color: #f5f0e8;
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.03em;
      padding: 14px 28px;
      border-radius: 2px;
    }

    .fallback-url {
      font-size: 14px;
      color: #666;
      margin-top: 16px;
    }

    .fallback-url a {
      color: #b5833a;
      text-decoration: underline;
    }

    .otp-label {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 12px;
    }

    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 44px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #1a1a1a;
      background: #f7f3ec;
      border: 1px solid #e0d9cc;
      border-radius: 4px;
      padding: 20px 16px;
      text-align: center;
      margin-bottom: 16px;
    }

    .expiry-note {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }

    @media only screen and (max-width: 480px) {
      body { padding: 24px 12px; }
      .email-header { padding: 28px 24px 24px; }
      .email-body { padding: 32px 24px; }
      .email-footer { padding: 20px 24px; }
      .app-name { font-size: 28px; }
      .headline { font-size: 26px; }
      .otp-code {
        font-size: 32px !important;
        letter-spacing: 0.12em !important;
        padding: 16px 10px !important;
      }
    }
  </style>`;

export const CHECK_IN_EMAIL_TEMPLATE = (
  bookTitle: string,
  checkoutDate: string,
  checkinDate: string,
  bookAuthor?: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Book Return Receipt - ${LIBRARY_NAME}</title>

  ${emailStyle}
</head>

<body>

<div class="email-wrapper">
  <div class="email-card">

    <div class="email-header">
      <div class="app-name">${LIBRARY_NAME}</div>
    </div>

    <div class="email-body">

      <h1 class="headline">
        Thank you for<br>
        <span>returning a book!</span>
      </h1>

      <p class="body-text">
        Your recent check-in has been processed successfully.
      </p>

      <table class="details-table" cellpadding="0" cellspacing="0" border="0">
        <tbody>

          <tr>
            <td class="details-label">Title</td>
            <td class="details-value">${bookTitle}</td>
          </tr>

          ${
            bookAuthor
              ? `
          <tr>
            <td class="details-label">Author</td>
            <td class="details-value">${bookAuthor}</td>
          </tr>
          `
              : ""
          }

          <tr>
            <td class="details-label">Checkout Date</td>
            <td class="details-value">${checkoutDate}</td>
          </tr>

          <tr>
            <td class="details-label">Check-in Date</td>
            <td class="details-value">${checkinDate}</td>
          </tr>

        </tbody>
      </table>


      <p class="body-text">
        Thank you for using ${LIBRARY_NAME}. We look forward to seeing you again.
      </p>

    </div>

    <div class="email-footer">
      <p class="footer-text">
        This receipt confirms that your returned item has been checked back into the library system.
      </p>
    </div>

  </div>
</div>

</body>
</html>
`;

export const CHECK_OUT_EMAIL_TEMPLATE = (
  bookTitle: string,
  checkoutDate: string,
  bookAuthor?: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Book Checkout Receipt - ${LIBRARY_NAME}</title>

  ${emailStyle}
</head>

<body>

<div class="email-wrapper">
  <div class="email-card">

    <div class="email-header">
      <div class="app-name">${LIBRARY_NAME}</div>
    </div>

    <div class="email-body">

      <h1 class="headline">
        Thank you for<br>
        <span>checking out a book!</span>
      </h1>

      <p class="body-text">
        Your checkout has been processed successfully. Here are the details of your borrowed item:
      </p>

      <table class="details-table" cellpadding="0" cellspacing="0" border="0">
        <tbody>

          <tr>
            <td class="details-label">Title</td>
            <td class="details-value">${bookTitle}</td>
          </tr>

          ${
            bookAuthor
              ? `
          <tr>
            <td class="details-label">Author</td>
            <td class="details-value">${bookAuthor}</td>
          </tr>
          `
              : ""
          }

          <tr>
            <td class="details-label">Checkout Date</td>
            <td class="details-value">${checkoutDate}</td>
          </tr>

        </tbody>
      </table>


      <p class="body-text">
        Enjoy your reading, and thank you for using ${LIBRARY_NAME}.
      </p>

    </div>

    <div class="email-footer">
      <p class="footer-text">
        This receipt confirms that your item has been checked out successfully through the library system.
      </p>
    </div>

  </div>
</div>

</body>
</html>
`;

export const NEW_ACCOUNT_EMAIL_SUBJECT = "Welcome to " + LIBRARY_NAME + "!";
export const NEW_ACCOUNT_EMAIL_TEMPLATE = (
  url: string,
  first_name: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${LIBRARY_NAME}</title>
  ${emailStyle}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">

      <div class="email-header">
        <div class="app-name">${LIBRARY_NAME}</div>
      </div>

      <div class="email-body">
        <h1 class="headline">Welcome to<br /><span>${LIBRARY_NAME}!</span></h1>

        <p class="body-text">
          Welcome ${first_name}, your web account has been created. To get started, set your password using the button below.
        </p>
        <p class="body-text">
          This link will expire in 24 hours. A new link can be generated by requesting a password reset on the login page.
        </p>

        <hr class="divider" />

        <a href="${url}" class="cta-button" style="color: #f5f0e8;">Set your password</a>

        <p class="fallback-url">
          Or <a href="${url}">use this link</a>
        </p>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          You're receiving this because an account was created for your email address at ${LIBRARY_NAME}.<br />
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

export const PASSWORD_RESET_EMAIL_SUBJECT =
  "Reset Your Password - " + LIBRARY_NAME;

export const RESET_PASSWORD_EMAIL_TEMPLATE = (
  url: string,
  first_name: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - ${LIBRARY_NAME}</title>
  ${emailStyle}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">

      <div class="email-header">
        <div class="app-name">${LIBRARY_NAME}</div>
      </div>

      <div class="email-body">
        <h1 class="headline">Password <span>Reset</span></h1>

        <p class="body-text">
          Hello ${first_name}, it looks like you requested a password reset. To reset your password, please use the button below.
        </p>
        <p class="body-text">
          This link will expire in 24 hours. A new link can be generated by requesting a password reset on the login page.
        </p>

        <hr class="divider" />

        <a href="${url}" class="cta-button" style="color: #f5f0e8;">Set your password</a>

        <p class="fallback-url">
          Or <a href="${url}">use this link</a>
        </p>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          You're receiving this because a password reset was requested for your account at ${LIBRARY_NAME}.<br />
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

export const OTP_EMAIL_SUBJECT = "One Time Password - " + LIBRARY_NAME;
export const OTP_EMAIL_TEMPLATE = (
  otp_code: string,
  first_name: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>One Time Password - ${LIBRARY_NAME}</title>
  ${emailStyle}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">

      <div class="email-header">
        <div class="app-name">${LIBRARY_NAME}</div>
      </div>

      <div class="email-body">
        <h1 class="headline">Hi, <span>${first_name}</span></h1>

        <p class="body-text">
          Use the code below to complete your sign-in to ${LIBRARY_NAME}.
        </p>

        <hr class="divider" />

        <p class="otp-label" style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#666;margin-bottom:12px;">Your authentication code</p>
        <div class="otp-code" style="font-family:'Courier New',Courier,monospace;font-size:44px;font-weight:700;letter-spacing:0.18em;color:#1a1a1a;background:#f7f3ec;border:1px solid #e0d9cc;border-radius:4px;padding:20px 16px;text-align:center;margin-bottom:16px;"><strong style="font-weight:700;">${otp_code}</strong></div>
        <p class="expiry-note" style="font-size:13px;color:#666;line-height:1.6;">This code expires in 3 minutes. Do not share it with anyone.</p>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          You're receiving this because a sign-in was attempted on your ${LIBRARY_NAME} account.<br />
          If this wasn't you, we recommend securing your account immediately.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
