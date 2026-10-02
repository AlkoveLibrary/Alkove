export function sanitizeIsbn(isbn?: string | null) {
  if (!isbn) {
    return isbn;
  }
  return isbn.replace(/[^0-9X]/gi, "").toUpperCase();
}

export function toIsbn13(isbn10: string) {
  const body = `978${isbn10.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(body[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${body}${check}`;
}

export function toIsbn10(isbn13: string) {
  if (!isbn13.startsWith("978")) {
    return null;
  }

  const body = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += (i + 1) * parseInt(body[i], 10);
  }
  const check = sum % 11;
  const checkChar = check === 10 ? "X" : String(check);
  return `${body}${checkChar}`;
}

export function validateIsbn(
  isbn: string,
  isScanned: boolean,
): { valid: boolean; error: string } {
  if (!isbn) {
    return { valid: false, error: "ISBN is required" };
  }
  const clean = isbn.replace(/[-\s]/g, "").toUpperCase();

  if (isScanned && clean.length === 12 && /^\d{12}$/.test(clean)) {
    return {
      valid: false,
      error:
        "This looks like a 12 digit UPC code. Check the inside front cover or the back of the book for an ISBN barcode.",
    };
  }

  if (clean.length !== 10 && clean.length !== 13) {
    return { valid: false, error: "ISBN must be 10 or 13 digits" };
  }

  if (clean.length === 10) {
    if (clean[9] !== "X" && !/^\d{10}$/.test(clean)) {
      return {
        valid: false,
        error: "ISBN-10 must be all numbers or end with X",
      };
    }

    // ISBN-10 checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (i + 1) * parseInt(clean[i], 10);
    }
    const check = clean[9] === "X" ? 10 : parseInt(clean[9], 10);
    if ((sum + 10 * check) % 11 !== 0) {
      return { valid: false, error: "Invalid ISBN-10 checksum" };
    }
    return { valid: true, error: "No error" };
  } else {
    if (!/^\d{13}$/.test(clean)) {
      return { valid: false, error: "ISBN-13 must be all numbers" };
    }

    // ISBN-13 must start with 978 or 979
    if (!(clean.startsWith("978") || clean.startsWith("979"))) {
      return { valid: false, error: "ISBN-13 must start with 978 or 979" };
    }
    // ISBN-13 checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(clean[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    if (check !== parseInt(clean[12], 10)) {
      return { valid: false, error: "Invalid ISBN-13 checksum" };
    }
    return { valid: true, error: "No error" };
  }
}
