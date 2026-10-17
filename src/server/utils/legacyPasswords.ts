import { createHash, timingSafeEqual } from "node:crypto";

const LEGACY_PREFIX: string = "legacy-md5:";
/** Mark an unchanged legacy hash so it cannot be mistaken for a current credential. */
export function importedLegacyHash(hash: string | null): string | null { return hash ? `${LEGACY_PREFIX}${Buffer.from(hash, "utf8").toString("base64")}` : null; }
/** Reproduce the legacy .NET ASCII MD5 followed by UTF-8 replacement decoding. */
export function legacyPasswordHash(password: string): string {
 const ascii: string = password.replace(/[^\x00-\x7f]/g, "?");
 return createHash("md5").update(ascii, "ascii").digest().toString("utf8");
}
/** Check only explicitly marked legacy credentials, preserving password case and spaces. */
export function matchesLegacyPassword(password: string, stored: string | null): boolean {
 if (!stored?.startsWith(LEGACY_PREFIX)) return false;
 const actual: Buffer = Buffer.from(legacyPasswordHash(password), "utf8");
 const expected: Buffer = Buffer.from(stored.slice(LEGACY_PREFIX.length), "base64");
 return actual.length === expected.length && timingSafeEqual(actual, expected);
}
