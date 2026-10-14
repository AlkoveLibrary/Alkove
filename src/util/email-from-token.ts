export const getEmailFromToken = (token: string | null) =>
  token
    ? (() => {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload?.email ?? null;
        } catch {
          return null;
        }
      })()
    : null;
