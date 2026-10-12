import type { ReportKind, ReportRow } from "../types/MentorReport";

/** Quote CSV values and neutralize spreadsheet formula prefixes. */
export function csvCell(value: string): string {
 const safe: string = /^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(value) ? `'${value}` : value;
 return `"${safe.replaceAll('"', '""')}"`;
}

/** Preserve the legacy report columns with lossless CSV escaping. */
export function reportCsv(kind: ReportKind, rows: ReportRow[]): string {
 const headings: string[] = kind === "belts" ? ["First Name", "Last Name", "Belt", "Awarded", "Notes"] : ["First Name", "Last Name", "Email Address"];
 const values: string[][] = rows.map((row: ReportRow): string[] => kind === "belts" ? [row.nameFirst, row.nameLast, row.belt?.color ?? "", row.awarded?.slice(0, 10) ?? "", row.notes] : [row.nameFirst, row.nameLast, row.email]);
 return "\uFEFF" + [headings, ...values].map((cells: string[]): string => cells.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
