import { ROLES } from "../../seeds/data/role";

export const ADMINISTRATOR_ONLY = [ROLES[0].role_id];

export const STAFF = [ROLES[0].role_id, ROLES[1].role_id];

export const ROLE_IDS = {
  ADMIN: ROLES[0].role_id,
  STAFF: ROLES[1].role_id,
  USER: ROLES[2].role_id,
};
