export const isGatedRoute = (path: string) => {
  const authRoutes = ["/staff", "/admin", "/profile", "/web-access"];
  return authRoutes.some((route) => path.startsWith(route));
};
