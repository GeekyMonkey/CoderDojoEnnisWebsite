import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const ID: string = "00000000-0000-4000-8000-000000000001";
const MISSING: string = "00000000-0000-4000-8000-000000000002";
let db: PGlite;

/** Call the actual SQL operation with the service role. */
async function signIn(testing: boolean = false, member: string = ID): Promise<Record<string, unknown>> {
 await db.exec("set role service_role");
 try { return (await db.query<{ result: Record<string, unknown> }>("select coderdojo.sign_in_attendance($1,'2026-10-12',$2) as result", [member, testing])).rows[0]!.result; }
 finally { await db.exec("reset role"); }
}

beforeAll(async (): Promise<void> => {
 db = new PGlite();
 await db.exec(readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"));
 await db.exec(readFileSync(new URL("../migrations/20261012181831_f01_role_based_rls.sql", import.meta.url), "utf8"));
 await db.exec(readFileSync(new URL("../migrations/20261012201421_f05_atomic_attendance_signin.sql", import.meta.url), "utf8"));
});
beforeEach(async (): Promise<void> => {
 await db.exec("drop trigger if exists fail_sign_in on coderdojo.members; drop trigger if exists fail_attendance on coderdojo.member_attendances; delete from coderdojo.member_attendances; delete from coderdojo.members;");
 await db.query("insert into coderdojo.members(id,name_first,is_ninja,email,password_hash,login_date,login_date_previous) values($1,'Original',true,'old@example.invalid','protected','2026-10-01 12:00:00','2026-09-01 12:00:00')", [ID]);
});
afterAll(async (): Promise<void> => { await db.close(); });

describe("atomic attendance sign-in", (): void => {
 it("commits attendance and rotates dates without returning a hash", async (): Promise<void> => {
  const result: Record<string, unknown> = await signIn();
  expect(result.sessionCount).toBe(1);
  expect(result.member).toMatchObject({ id: ID, login_date_previous: "2026-10-01T12:00:00.000Z" });
  expect(result.member).not.toHaveProperty("password_hash");
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(1);
 });
 it("repeated sign-ins retain one attendance and rotate from the committed login", async (): Promise<void> => {
  const first: Record<string, unknown> = await signIn();
  const second: Record<string, unknown> = await signIn();
  expect(second.sessionCount).toBe(1);
  expect((second.member as Record<string, unknown>).login_date_previous).toBe((first.member as Record<string, unknown>).login_date);
 });
 it("preserves newer profile, role, archive, scanner and credential edits", async (): Promise<void> => {
  await db.query("update coderdojo.members set name_first='Updated',email='new@example.invalid',is_mentor=true,deleted=true,nfc_tag='new-device',password_hash='new-protected' where id=$1", [ID]);
  const result: Record<string, unknown> = await signIn();
  expect(result.member).toMatchObject({ name_first: "Updated", email: "new@example.invalid", is_mentor: true, deleted: true, nfc_tag: "new-device" });
  expect((await db.query("select password_hash from coderdojo.members")).rows[0]).toEqual({ password_hash: "new-protected" });
 });
 it("rolls back attendance if the member date update fails", async (): Promise<void> => {
  await db.exec("create or replace function public.fail_sign_in() returns trigger language plpgsql as $$ begin raise exception 'forced update failure'; end $$; create trigger fail_sign_in before update on coderdojo.members for each row execute function public.fail_sign_in();");
  await expect(signIn()).rejects.toThrow("forced update failure");
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(0);
  expect((await db.query("select login_date::text as date from coderdojo.members")).rows[0]).toEqual({ date: "2026-10-01 12:00:00" });
 });
 it("does not rotate dates when attendance insertion fails", async (): Promise<void> => {
  await db.exec("create trigger fail_attendance before insert on coderdojo.member_attendances for each row execute function public.fail_sign_in();");
  await expect(signIn()).rejects.toThrow("forced update failure");
  expect((await db.query("select login_date::text as date from coderdojo.members")).rows[0]).toEqual({ date: "2026-10-01 12:00:00" });
 });
 it("preserves testing simulation without persisting attendance", async (): Promise<void> => {
  const result: Record<string, unknown> = await signIn(true);
  expect(result.sessionCount).toBe(1);
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(0);
  expect((result.member as Record<string, unknown>).login_date).not.toBe("2026-10-01T12:00:00.000Z");
 });
 it("rejects a removed member without creating rows", async (): Promise<void> => {
  await expect(signIn(false, MISSING)).rejects.toThrow("Member unavailable");
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(0);
 });
 it.each(["anon", "authenticated"])("denies RPC execution to %s", async (role: string): Promise<void> => {
  await db.exec(`set role ${role}`);
  try { await expect(db.query("select coderdojo.sign_in_attendance($1,'2026-10-12',false)", [ID])).rejects.toThrow("permission denied"); }
  finally { await db.exec("reset role"); }
 });
});
