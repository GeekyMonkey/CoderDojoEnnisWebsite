import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const ACTOR: string = "00000000-0000-4000-8000-000000000001";
const CODER: string = "00000000-0000-4000-8000-000000000002";
const MENTOR: string = "00000000-0000-4000-8000-000000000003";
let db: PGlite;
/** Exercise the real merge RPC with the exact current preview snapshots. */
async function merge(keep: string, duplicate: string, fields: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
 const snapshots: { rows: { id: string; snapshot: object }[] } = await db.query("select id,to_jsonb(m)-array['password_hash','login_date','login_date_previous'] as snapshot from coderdojo.members m where id in ($1,$2)", [keep, duplicate]);
 await db.exec("set role service_role");
 try {
  return (await db.query<{ member: Record<string, unknown> }>("select coderdojo.merge_members($1,$2,$3,$4,$5,$6) as member", [ACTOR, keep, duplicate, fields, snapshots.rows.find((row: { id: string; snapshot: object }): boolean => row.id === keep)!.snapshot, snapshots.rows.find((row: { id: string; snapshot: object }): boolean => row.id === duplicate)!.snapshot])).rows[0]!.member;
 } finally { await db.exec("reset role"); }
}
beforeAll(async (): Promise<void> => {
 db = new PGlite();
 await db.exec(readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"));
 await db.exec("grant usage on schema coderdojo to service_role; grant all on all tables in schema coderdojo to service_role");
 await db.exec(readFileSync(new URL("../migrations/20261012020454_member_merge_and_printing.sql", import.meta.url), "utf8"));
 const migrations: string[] = readdirSync(new URL("../migrations/", import.meta.url)).filter((name: string): boolean => (name.endsWith("_merge_member_roles.sql") || name.endsWith("_reviewed_merge_fields.sql"))).sort();
 for (const migration of migrations) await db.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
});
beforeEach(async (): Promise<void> => {
 await db.exec("truncate coderdojo.members, coderdojo.member_attendances, coderdojo.member_badge_categories cascade");
 await db.query("insert into coderdojo.members(id,is_ninja,is_mentor,is_parent,password_hash) values ($1,false,true,false,'actor'),($2,true,false,false,'coder'),($3,false,true,true,'mentor')", [ACTOR, CODER, MENTOR]);
});
afterAll(async (): Promise<void> => { await db.close(); });
describe("merged account roles", (): void => {
 it.each([[CODER, MENTOR], [MENTOR, CODER]])("preserves coder, mentor and parent roles keeping %s", async (keep: string, duplicate: string): Promise<void> => {
  await db.query("insert into coderdojo.member_attendances(member_id,date) values($1,'2026-10-17')", [duplicate]);
  const member: Record<string, unknown> = await merge(keep, duplicate);
  expect(member).toMatchObject({ id: keep, is_ninja: true, is_mentor: true, is_parent: true, deleted: false });
  expect(member).not.toHaveProperty("password_hash");
  expect((await db.query("select deleted from coderdojo.members where id=$1", [duplicate])).rows[0]).toEqual({ deleted: true });
  expect((await db.query("select member_id from coderdojo.member_attendances")).rows[0]).toEqual({ member_id: keep });
  expect((await db.query("select password_hash from coderdojo.members where id=$1", [keep])).rows[0]).toEqual({ password_hash: keep === CODER ? "coder" : "mentor" });
 });
 it("keeps non-coder accounts non-coders", async (): Promise<void> => {
  await db.query("update coderdojo.members set is_ninja=false where id=$1", [CODER]);
  expect(await merge(CODER, MENTOR)).toMatchObject({ is_ninja: false, is_mentor: true, is_parent: true });
 });
 it("still rejects merging the acting mentor", async (): Promise<void> => {
  await expect(merge(ACTOR, CODER)).rejects.toThrow("Cannot merge this account");
 });
 it("still rejects directly linked parent and coder accounts", async (): Promise<void> => {
  await db.query("insert into coderdojo.member_parents(member_id,parent_id) values($1,$2)", [CODER, MENTOR]);
  try { await expect(merge(CODER, MENTOR)).rejects.toThrow("Linked accounts cannot be merged"); }
  finally { await db.exec("truncate coderdojo.member_parents"); }
 });
 it("persists reviewed discrepancies and image flags while retaining the chosen credentials", async (): Promise<void> => {
  const fields: Record<string, unknown> = { name_first: "Chosen", name_last: "Name", email: "chosen@example.invalid", birth_year: 2000, fingerprint_id: 42, nfc_tag: "chosen-tag", garda_vetted: true, registered_current_term: true, has_photo: true, has_avatar: true };
  expect(await merge(MENTOR, CODER, fields)).toMatchObject({ ...fields, id: MENTOR, is_ninja: true, is_mentor: true });
  expect((await db.query("select password_hash from coderdojo.members where id=$1", [MENTOR])).rows[0]).toEqual({ password_hash: "mentor" });
 });
 it("rejects injected identity and password changes", async (): Promise<void> => {
  await expect(merge(CODER, MENTOR, { login: "injected" })).rejects.toThrow("Invalid merge fields");
  await expect(merge(CODER, MENTOR, { password_hash: "injected" })).rejects.toThrow("Invalid merge fields");
 });

 it.each(["anon", "authenticated"])("denies merge RPC execution for %s", async (role: string): Promise<void> => {
  await db.exec(`set role ${role}`);
  try { await expect(db.query("select coderdojo.merge_members($1,$2,$3,'{}','{}','{}')", [ACTOR, CODER, MENTOR])).rejects.toThrow("permission denied"); }
  finally { await db.exec("reset role"); }
 });

});
