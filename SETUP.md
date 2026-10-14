### Before You Start

These instructions assume a bash/zsh shell on Linux or Mac. All commands in `code blocks` are shell commands and are run in the project's root directory unless otherwise stated.

Before starting, duplicate the file .env.example to .env

Any changes to the .env value will require restarting the development server. Code changes will reflect immediately in the dev server.

### Next.JS server

This will require Node 24.

Once the repo is cloned, the first step is to download the Next.JS dependencies.

Yarn is used for examples, but any preferred package manager (eg: npm) can be used.

Run `yarn` to install the Next.JS dependencies.

The development server can be started with `yarn dev`

The site should now be accessible at http://localhost:3000 but without the database connection, there will be no data and most requests will fail.

### Database

The recommended method is to use Docker. Since the project uses Prisma, any database type can be used, Docker or native. Instructions will be given for Docker setup only.

First, install Docker on the host machine.

Run `docker compose up` in the root directory. This will load the details from docker-compose.yml and create a Postgres database accessible at localhost:5432

Run `yarn prisma migrate reset` to run the migrations and seed the database with initial data.

The .env value `DATABASE_URL` must reflect the details of the database in use. The default value is set.

The site at http://localhost:3000 should display some test books that were seeded in the database and all OPAC features like the book catalog should work. Logging in will not work yet.

### PocketBase

For authentication, download PocketBase and run. The details are outlined here: https://pocketbase.io/docs/

This doesn't have to (and probably shouldn't) be in this project directory. To start the Pocketbase server, navigate to the downloaded executable and run

`./pocketbase serve`

Navigate to http://localhost:8090/_/ (the /_/ is important)

There should be on-screen prompts to create a superuser for accessing Pocketbase web console. Since Pocketbase is proxied through the Next.JS server and is not accessible through the public internet, this account doesn't need to be secure. This address also does not need to receive emails. This is not an account for the Alkove application.

The email and password for this superuser account must be put into the .env file under `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD`. The application logs in as the superuser to handle admin read and write actions.

Once the superuser for accessing the web console is set up, the `users` collection must be configured to match what the application needs. Using 'Import collections' feature of PocketBase, import `pb_schema.json` from 'pocketbase' directory of this repo. This configuration includes the email configuration, database structure, and authentication configuration.

The next step will be to create a user that matches the default seeded Alkove admin user. Create a user through the Pocketbase web console (not superuser) with the id that matches the seeded user's auth_id (not their user_id). By default this value will be `a7622a60-137f-41db-af14-212830d67d44`. Set the email address matching to the seeded default admin user. By default this value is `admin@alkove.ca` which will work to login but obviously cannot receive any emails like forgot password emails. To change this value, make sure the email in the database under the user record matches this user in Pocketbase. Once created, this user can be logged in and all the rest of the accounts can be created through the Alkove application.

#### This step is not required to start.

For sending emails, the default behaviour for Pocketbase is overridden with a Javascript hook. This is so the Alkove server can differentiate between new accounts and forgot password emails (along with handling SMTP, styles, and populating library name/username in one location). Create a directory in the location of the executable called 'pb_hooks'. Copy 'main.pb.js' from the 'pocketbase' directory in this repo into the new directory.

This file will also need a matching key to the key set in the .env for `MAIL_SENDER_API_KEY`. This can be any random string, as long as they match

The .env value `POCKETBASE_URL` must reflect the domain and port being hosted on. The default value is set.

### Nodemailer

SMTP credentials are required for users to receive emails to create their new passwords. The application can be used without this step for evaluation purposes.

These can be generated from Gmail or Outlook and entered in the .env file.

### Configuration

The configuration for running the application and the library name is set in the .env file. Less critical preferences for how the application looks and operates is set in `src/config.ts`

### Going to Production

To make this production ready, the project must be built first. Switch the .env value `STAGE` to something other than development. Run `yarn build`. If there are any Typescript errors, the build will fail. Once completed, run `yarn start` to start the production server. Your production instance will be available at http://localhost:3000

Next.JS does not supply any method of serving the production server over https. To make this publicly accessible over https on a domain name or IP address, a reverse proxy like Caddy can easily generate https certificates and handle https traffic for production use.

### Production Pocketbase Configuration

These additional fields are not set with importing the JSON config and must be set manually.

#### Rate Limiting

Rate limiting for authentication routes is disabled by default. For production, this should be enabled. To cover the sensitive routes, configuration such as the following should be added.

| Rate limit label                                | Max requests (per IP) | Interval (in seconds) | Targeted users |
| ----------------------------------------------- | --------------------- | --------------------- | -------------- |
| `users:update`                                  | 5                     | 30                    | All            |
| `/api/collections/users/auth-with-password`     | 5                     | 30                    | All            |
| `/api/collections/users/request-password-reset` | 1                     | 120                   | All            |
| `/api/collections/users/auth-with-otp`          | 5                     | 30                    | All            |

If you are using a reverse proxy to host Alkove, then forward IP headers need to be set for this to function as intended.

#### Forward IP Headers

With a reverse proxy, all requests will be from localhost and rate limiting will be global to all users instead of per IP address. Set User IP Proxy Headers in Pocketbase.
