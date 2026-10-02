yarn run v1.22.22
$ /home/danwardvs/Documents/OpenShelf/node_modules/.bin/prisma migrate diff --from-empty --to-schema ./prisma/schema.prisma --script
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EventAction" AS ENUM ('read', 'write');

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "email" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "auth_id" TEXT,
    "role_id" UUID NOT NULL,
    "last_login" TIMESTAMP(3),
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Book" (
    "book_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "isbn" TEXT,
    "cover_id" UUID,
    "publication_year" INTEGER,
    "category" TEXT,
    "genre" TEXT,
    "page_count" INTEGER,
    "description" TEXT,
    "edition" TEXT,
    "format" TEXT,
    "edition_year" INTEGER,
    "publisher" TEXT,
    "dewey_decimal" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "Copy" (
    "copy_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "condition" TEXT,
    "notes" TEXT,
    "location" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("copy_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "copy_id" UUID NOT NULL,
    "held_at" TIMESTAMP(3),
    "hold_cancelled_at" TIMESTAMP(3),
    "checked_out_at" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "error_log_id" UUID NOT NULL,
    "ip_address" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT,
    "user_agent" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "error_dump" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("error_log_id")
);

-- CreateTable
CREATE TABLE "Cover" (
    "cover_id" UUID NOT NULL,
    "openlibrary_cover_id" INTEGER,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cover_pkey" PRIMARY KEY ("cover_id")
);

-- CreateTable
CREATE TABLE "MailLog" (
    "mail_log_id" UUID NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "error" TEXT,
    "sent_at" TIMESTAMP(3),
    "error_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailLog_pkey" PRIMARY KEY ("mail_log_id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "event_log_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" "EventAction" NOT NULL,
    "data" JSONB,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("event_log_id")
);

-- CreateTable
CREATE TABLE "BookRequest" (
    "book_request_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookRequest_pkey" PRIMARY KEY ("book_request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_id_key" ON "User"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Book_cover_id_key" ON "Book"("cover_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "Cover"("cover_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "Copy"("copy_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRequest" ADD CONSTRAINT "BookRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

Done in 1.05s.
