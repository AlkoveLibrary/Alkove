import { ExportField, SortDirection } from "constants/export";

type CsvValue = string | number | boolean | Date | null | undefined;

const escapeCsvValue = (value: CsvValue) => {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (
  fields: readonly ExportField[],
  rows: Record<string, CsvValue>[],
) => {
  const header = fields.map((field) => escapeCsvValue(field.label)).join(",");
  const lines = rows.map((row) =>
    fields.map((field) => escapeCsvValue(row[field.key])).join(","),
  );
  return [header, ...lines].join("\r\n");
};

const toComparable = (value: CsvValue) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") return value.trim().toLowerCase() || null;
  return value ?? null;
};

export const sortRows = <T extends Record<string, CsvValue>>(
  rows: T[],
  key: string,
  direction: SortDirection,
) =>
  [...rows].sort((a, b) => {
    const multiplier = direction === "desc" ? -1 : 1;
    const left = toComparable(a[key]);
    const right = toComparable(b[key]);
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * multiplier;
    }
    return (
      String(left).localeCompare(String(right), undefined, {
        numeric: true,
      }) * multiplier
    );
  });
