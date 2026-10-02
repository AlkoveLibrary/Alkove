/* eslint-disable react/no-unescaped-entities */

import {
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useState } from "react";
import { PAGES } from "constants/pages";
import { toIsbn10, toIsbn13, validateIsbn } from "util/validate-isbn";
import Head from "next/head";
import { LIBRARY_NAME } from "config/config";

export default function UsersPage() {
  const router = useRouter();
  const [isbnInput, setIsbnInput] = useState("");
  const [isbnError, setIsbnError] = useState("");
  const [validatedIsbn, setValidatedIsbn] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<
    "valid" | "invalid" | null
  >(null);

  const cleanedInput = isbnInput.replace(/[-\s]/g, "").toUpperCase();
  const isValidIsbn10 = validatedIsbn?.length === 10;
  const isValidIsbn13 = validatedIsbn?.length === 13;
  const canConvertTo13 = Boolean(isValidIsbn10);
  const canConvertTo10 =
    Boolean(isValidIsbn13) && Boolean(validatedIsbn?.startsWith("978"));

  const handleValidateIsbn = () => {
    const result = validateIsbn(cleanedInput, false);
    if (!result.valid) {
      setIsbnError(result.error);
      setValidatedIsbn(null);
      setValidationState("invalid");
      return;
    }

    setIsbnError("");
    setValidatedIsbn(cleanedInput);
    setValidationState("valid");
  };

  const handleConvertTo13 = () => {
    if (!validatedIsbn || validatedIsbn.length !== 10) {
      return;
    }

    const converted = toIsbn13(validatedIsbn);
    setIsbnInput(converted);
    setValidatedIsbn(converted);
    setIsbnError("");
    setValidationState("valid");
  };

  const handleConvertTo10 = () => {
    if (!validatedIsbn || validatedIsbn.length !== 13) {
      return;
    }

    const converted = toIsbn10(validatedIsbn);
    if (!converted) {
      return;
    }

    setIsbnInput(converted);
    setValidatedIsbn(converted);
    setIsbnError("");
    setValidationState("valid");
  };

  return (
    <>
      <Head>
        <title>User Manual - {LIBRARY_NAME}</title>
      </Head>
      <Box sx={{ p: 3 }}>
        <Box sx={{ width: { xs: "100%", md: "60%" }, mx: "auto" }}>
          <IconButton
            onClick={() => router.push(PAGES.STAFF.HOME)}
            sx={{ mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              User Manual
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ whiteSpace: "pre-line" }}>
            <u>Concepts</u>
          </Typography>
          <Typography>
            The library catalog is based on "book" records. A book record
            contains a unique ISBN, and some details about the book such as
            author, description, and year published. A "copy" record is a record
            of a physical object and contains its location, condition, and
            availability. For one book record, there will be one or many copies
            associated with it. The copies are what are checked in and out in
            "transactions". A transaction is created when a book is checked out
            and is associated with a user. The check in time is also recorded on
            this same transaction.
          </Typography>
          <br />
          <Typography variant="h5" sx={{ whiteSpace: "pre-line" }}>
            <u>ISBN</u>
          </Typography>
          <Typography>
            The International Standard Book Number is a 10 or 13 digit number
            given to all books since 1970. Books older or some self-published
            books may not have an ISBN, and can be created with an override in
            the database. These are unique to the edition or print of the book.
            For example, a hardcover and softcover copy will have a different
            ISBN, even if they have the identical cover and contents.
          </Typography>
          <Typography variant="h6">ISBN-10</Typography>

          <Typography>
            The 10 digit ISBN was the original form for ISBN. It contains nine
            digits and a check digit, which can be a digit or X (for 10). The
            check digit is calculated from an equation based on all the rest of
            the digits and is used to validate the accuracy of the ISBN.
          </Typography>
          <Typography variant="h6">ISBN-13</Typography>

          <Typography>
            The 13 digit ISBN is a newer standard introduced in 2007. It starts
            with the prefix "978" or uncommonly "979". Then, like the ISBN-10,
            it has nine digits for the identifier and then a check digit. Any
            ISBN-10 can be converted to a ISBN-13 by adding the 978 prefix and
            generating a new check digit. Most new books will have both printed
            but will have the ISBN-13 as a barcode.
          </Typography>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Validate ISBN
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="ISBN"
                value={isbnInput}
                onChange={(e) => {
                  setIsbnInput(e.target.value);
                  setIsbnError("");
                  setValidationState(null);
                  setValidatedIsbn(null);
                }}
                error={Boolean(isbnError)}
                helperText={isbnError || "Enter ISBN-10 or ISBN-13"}
              />
              <Button variant="contained" onClick={handleValidateIsbn}>
                Validate
              </Button>
              <Button
                variant="outlined"
                onClick={handleConvertTo10}
                disabled={!canConvertTo10}
              >
                Convert to ISBN-10
              </Button>
              <Button
                variant="outlined"
                onClick={handleConvertTo13}
                disabled={!canConvertTo13}
              >
                Convert to ISBN-13
              </Button>
            </Box>
            {validationState ? (
              <Chip
                sx={{ mt: 1 }}
                label={validationState === "valid" ? "Valid" : "Invalid"}
                color={validationState === "valid" ? "success" : "error"}
              />
            ) : null}
          </Box>
          <br />

          <Typography variant="h5" sx={{ whiteSpace: "pre-line" }}>
            <u>Online Public Access Catalog</u>
          </Typography>
          <Typography>
            The OPAC is available at the root of the website at{" "}
            <a
              href={process.env.NEXT_PUBLIC_WEB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {process.env.NEXT_PUBLIC_WEB_URL}
            </a>{" "}
            and can be used by anyone without an account. Anyone can view the
            book catalog and the location and availability of the book's copies.
          </Typography>
          <br />

          <Typography variant="h5" sx={{ whiteSpace: "pre-line" }}>
            <u>Users</u>
          </Typography>
          <Typography>
            To check out a book, a user record must be created.
          </Typography>
          <Typography variant="h6">Local User</Typography>
          <Typography>
            A "local user" requires only a name. An email address is optional
            and check in/out confirmation emails will be sent if the email is
            included. This account will not have a password and cannot be logged
            in to.
          </Typography>
          <Typography variant="h6">Web User</Typography>
          <Typography>
            A local user can be promoted to a "web user" if the email is
            included on the user record. Promoting the user will send a welcome
            email and instructions to set their password. Once set, the web user
            can log in and view current and past book transactions.
          </Typography>
          <Typography variant="h6">Staff</Typography>
          <Typography>
            A "staff" user can do all of the above but also perform librarian
            duties. Staff can create/edit book records, user records, and
            transactions. They will be responsible for checking books in and
            out.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
