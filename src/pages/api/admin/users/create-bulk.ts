import { authenticateUser } from "backend/authenticate-user";
import { requestHandler } from "backend/request-handler";
import { createUser, getUserByEmail } from "backend/user";
import { ADMINISTRATOR_ONLY, ROLE_IDS } from "constants/roles";
import { validateRole } from "util/validate-role";
import { validateBody } from "util/validate-body";
import { bulkCreateUserSchema } from "schema/user";
import { BulkResult } from "types/user";
import { createEventLog } from "util/create-event-log";
import { EventAction } from "@prisma/client";

export default requestHandler({
  post: async (req) => {
    const requestingUser = await authenticateUser(req);
    validateRole(requestingUser, ADMINISTRATOR_ONLY);

    const body = validateBody(req.body, bulkCreateUserSchema);

    await createEventLog({
      req,
      action: EventAction.write,
      event: "Bulk create users",
      type: "admin",
      user_id: requestingUser.user_id,
      data: {
        user_count: body.users.length,
      },
    });

    const users = body.users;
    const results: BulkResult[] = [];

    for (const [i, userData] of users.entries()) {
      try {
        const { first_name, last_name, email } = userData;
        const lowerCaseEmail = email?.toLowerCase();
        // Check for existing user by email
        if (lowerCaseEmail) {
          const existingUser = await getUserByEmail(lowerCaseEmail);
          if (existingUser) {
            results.push({
              index: i,
              created: false,
              message: "Email already in use",
            });
            continue;
          }
        }

        const role_id = ROLE_IDS.USER;
        const auth_id: string | undefined = undefined;

        await createUser({
          first_name,
          last_name,
          email: lowerCaseEmail,
          role_id,
          auth_id,
        });
        results.push({
          index: i,
          created: true,
          message: "User created successfully",
        });
      } catch (error) {
        results.push({
          index: i,
          created: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { results };
  },
});
