import { User } from "@prisma/client";
import { PAGES } from "constants/pages";
import { NextRouter } from "next/router";
import { ROLE_IDS } from "constants/roles";

export const loginRedirect = (user: User, router: NextRouter) => {
  if (user.role_id === ROLE_IDS.STAFF) router.push(PAGES.STAFF.HOME);
  else if (user.role_id === ROLE_IDS.ADMIN) router.push(PAGES.ADMIN.HOME);
  else router.push(PAGES.OPAC.HOME);
};
