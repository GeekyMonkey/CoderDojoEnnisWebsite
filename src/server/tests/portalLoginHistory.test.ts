import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { coderRecentDecisions } from "#shared/utils/CoderWelcome";
import type { AchievementReview } from "#shared/types/AchievementReview";

const ID: string = "00000000-0000-4000-8000-000000000001";
const AUTH: string = "00000000-0000-4000-8000-000000000101";
let db: PGlite;
/** Call the real service-only portal history transaction. */
async function record(kind: string = "password", credential: string = "protected", auth: string = AUTH): Promise<Record<string, unknown>> {
 await db.exec("set role service_role");
 try { return (await db.query<{ member: Record<string, unknown> }>("select coderdojo.record_portal_login($1,$2,$3,$4) as member", [ID, auth, kind, credential])).rows[0]!.member; }
 finally { await db.exec("reset role"); }
}
beforeAll(async (): Promise<void> => {
 db = new PGlite();
 await db.exec(readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"));
 await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now());", [AUTH, `${ID}@coderdojoennis.com`]);
 await db.query("insert into coderdojo.members(id,name_first,is_ninja,password_hash,nfc_tag) values($1,'Coder',true,'protected','device');", [ID]);
 await db.exec(readFileSync(new URL("../migrations/20261012181831_f01_role_based_rls.sql", import.meta.url), "utf8"));
 await db.exec(readFileSync(new URL("../migrations/20261012210046_f06_portal_login_history.sql", import.meta.url), "utf8"));
});
beforeEach(async (): Promise<void> => {
 await db.exec("drop trigger if exists fail_portal_login on coderdojo.members; update coderdojo.members set deleted=false,is_ninja=true,name_first='Coder',password_hash='protected',nfc_tag='device',login_date=null,login_date_previous=null;");
});
afterAll(async (): Promise<void> => { await db.close(); });
describe("portal login history transaction", (): void => {
 it("first login sets current date and leaves previous null without attendance", async (): Promise<void> => {
  const member: Record<string, unknown> = await record();
  expect(member.login_date).toMatch(/Z$/); expect(member.login_date_previous).toBeNull();
  expect(member).not.toHaveProperty("password_hash");
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(0);
 });
 it("repeated NFC/password logins rotate from the committed date", async (): Promise<void> => {
  const first: Record<string, unknown> = await record();
  const second: Record<string, unknown> = await record("nfc", "device");
  expect(second.login_date_previous).toBe(first.login_date);
 });
 it("preserves newer profile fields while returning the current member", async (): Promise<void> => {
  await db.exec("update coderdojo.members set name_first='Updated',email='new@example.invalid',is_parent=true,registered_current_term=true");
  expect(await record()).toMatchObject({ name_first: "Updated", email: "new@example.invalid", is_parent: true, registered_current_term: true });
 });
 it.each([["password", "wrong"], ["nfc", "old-device"]])("rejects changed %s credentials without rotating dates", async (kind: string, credential: string): Promise<void> => {
  await expect(record(kind, credential)).rejects.toThrow("Credentials changed");
  expect((await db.query("select login_date from coderdojo.members")).rows[0]).toEqual({ login_date: null });
 });
 it("rejects archival after credential lookup", async (): Promise<void> => {
  await db.exec("update coderdojo.members set deleted=true");
  await expect(record()).rejects.toThrow("Member unavailable");
 });
 it("rejects a different/unbound auth identity", async (): Promise<void> => {
  await expect(record("password", "protected", ID)).rejects.toThrow("Member unavailable");
 });
 it("rolls back failed login date persistence", async (): Promise<void> => {
  await db.exec("create function public.fail_portal_login() returns trigger language plpgsql as $$ begin raise exception 'forced login failure'; end $$; create trigger fail_portal_login before update on coderdojo.members for each row execute function public.fail_portal_login();");
  await expect(record()).rejects.toThrow("forced login failure");
  expect((await db.query("select login_date,login_date_previous from coderdojo.members")).rows[0]).toEqual({ login_date: null, login_date_previous: null });
 });
 it.each(["anon", "authenticated"])("denies client RPC execution for %s", async (role: string): Promise<void> => {
  await db.exec(`set role ${role}`);
  try { await expect(db.query("select coderdojo.record_portal_login($1,$2,'password','protected')", [ID, AUTH])).rejects.toThrow("permission denied"); }
  finally { await db.exec("reset role"); }
 });
 it("uses the rotated previous-login day for welcome decision boundaries", async (): Promise<void> => {
  await db.exec("update coderdojo.members set login_date='2026-10-01 12:00:00'");
  const member: Record<string, unknown> = await record();
  const base: AchievementReview = { id: "at", definitionId: ID, definitionDeleted: false, goalDate: null, memberId: ID, memberName: "Coder", kind: "belt", categoryId: null, categoryName: null, label: "White", sortOrder: 1, belt: null, description: "", applicationDate: null, applicationNotes: null, awarded: Date.parse("2026-10-01T00:00:00Z"), awardedNotes: null, awardedByAdultId: null, rejectedDate: null, rejectedNotes: null, rejectedByAdultId: null };
  const before: AchievementReview = { ...base, id: "before", awarded: Date.parse("2026-09-30T23:59:59Z") };
  expect(coderRecentDecisions([before, base], Date.parse(String(member.login_date_previous))).map((row: AchievementReview): string => row.id)).toEqual(["at"]);
 });
});
