export const PAGES = {
  PROFILE: "/profile",
  LOGIN: "/login",
  STAFF: {
    HOME: "/staff",
    STATS: "/staff/stats",
    USER_MANUAL: "/staff/user-manual",
    BOOK_REQUESTS: "/staff/book-requests",
    BORROWED: "/staff/borrowed",
    HOLDS: "/staff/holds",
    BOOKS: {
      HOME: "/staff/books",
      CREATE: "/staff/books/create",
      BOOK: {
        HOME: "/staff/books/[book_id]",
        EDIT: "/staff/books/[book_id]/edit",
      },
    },
    USERS: {
      HOME: "/staff/users",
      USER: "/staff/users/[user_id]",
    },
    TRANSACTIONS: {
      HOME: "/staff/transactions",
      BOOK: "/staff/transactions/book",
    },
  },
  OPAC: {
    HOME: "/",
    BOOK: "/books/[book_id]",
    BOOKS: "/books",
    ABOUT: "/about",
  },

  ADMIN: {
    HOME: "/admin",
    BOOKS: {
      HOME: "/admin/books",
      COVERS: "/admin/books/covers",
    },
    USERS: {
      HOME: "/admin/users",
      IMPORT: "/admin/users/import",
    },
    TRANSACTIONS: "/admin/transactions",
    ERROR_LOGS: "/admin/logs/error",
    AUTH_LOGS: "/admin/logs/auth",
    MAIL_LOGS: "/admin/logs/mail",
    EVENT_LOGS: "/admin/logs/event",
  },

  WEB_ACCESS: {
    HOME: "/web-access/my-books",
    REQUEST: "/web-access/request",
  },
};
