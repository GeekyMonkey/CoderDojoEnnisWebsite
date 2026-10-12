import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const MEMBER: string = "00000000-0000-4000-8000-000000000001";
const AUTH: string = "00000000-0000-4000-8000-000000000101";
const SESSION: string = "00000000-0000-4000-8000-000000000201";
let db: PGlite;

/** Execute a query under an actual database role and JWT session claim. */
async function asRole(role: string, query: string, session: string = SESSION): Promise<Record<string, unknown>[]> {
 await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [AUTH, JSON.stringify({ sub: AUTH, session_id: session })]);
 await db.exec(`set role ${role}`);
 try { return (await db.query<Record<string, unknown>>(query)).rows; }
 finally { await db.exec("reset role"); }
}
beforeAll(async (): Promise<void> => {
 db = new PGlite();
 await db.exec(readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"));
 await db.exec("create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;");
 await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now());", [AUTH, `${MEMBER}@coderdojoennis.com`]);
 await db.query("insert into coderdojo.members(id,name_first,is_mentor) values($1,'Mentor',true);", [MEMBER]);
 await db.exec(readFileSync(new URL("../migrations/20261012181831_f01_role_based_rls.sql", import.meta.url), "utf8"));
 await db.exec(readFileSync(new URL("../migrations/20261012214542_f12_bounded_kiosk.sql", import.meta.url), "utf8"));
});
beforeEach(async (): Promise<void> => { await db.exec("truncate coderdojo_private.kiosk_revoked_sessions; update coderdojo.members set deleted=false,is_mentor=true"); });
afterAll(async (): Promise<void> => { await db.close(); });
describe("kiosk portal revocation", (): void => {
 it("blocks the old mentor JWT in RLS while permitting a fresh session", async (): Promise<void> => {
  expect(await asRole("authenticated", "select id from coderdojo.members")).toEqual([{ id: MEMBER }]);
  await asRole("service_role", `select coderdojo.revoke_portal_for_kiosk('${AUTH}','${SESSION}')`);
  expect(await asRole("authenticated", "select id from coderdojo.members")).toEqual([]);
  expect(await asRole("authenticated", "select coderdojo_private.current_member_id() as id")).toEqual([{ id: null }]);
  expect(await asRole("authenticated", "select id from coderdojo.members", MEMBER)).toEqual([{ id: MEMBER }]);
 });
 it("reports revocation only through a service-only lookup", async (): Promise<void> => {
  expect(await asRole("service_role", `select coderdojo.is_kiosk_session_revoked('${SESSION}') as revoked`)).toEqual([{ revoked: false }]);
  await asRole("service_role", `select coderdojo.revoke_portal_for_kiosk('${AUTH}','${SESSION}')`);
  expect(await asRole("service_role", `select coderdojo.is_kiosk_session_revoked('${SESSION}') as revoked`)).toEqual([{ revoked: true }]);
 });
 it.each(["anon", "authenticated"])("denies %s access to registry and service functions", async (role: string): Promise<void> => {
  for (const query of ["select * from coderdojo_private.kiosk_revoked_sessions", `select coderdojo.is_kiosk_session_revoked('${SESSION}')`, `select coderdojo.revoke_portal_for_kiosk('${AUTH}','${SESSION}')`]) await expect(asRole(role, query)).rejects.toMatchObject({ code: "42501" });
 });
 it.each(["is_mentor=false", "deleted=true"])("rejects changed mentor authority %s", async (change: string): Promise<void> => {
  await db.exec(`update coderdojo.members set ${change}`);
  await expect(asRole("service_role", `select coderdojo.revoke_portal_for_kiosk('${AUTH}','${SESSION}')`)).rejects.toMatchObject({ code: "42501" });
  expect((await db.query("select * from coderdojo_private.kiosk_revoked_sessions")).rows).toHaveLength(0);
 });
 it("keeps registration idempotent and changes no member fields or attendance", async (): Promise<void> => {
  const before: Record<string, unknown>[] = (await db.query("select * from coderdojo.members")).rows;
  for (let i: number = 0; i < 2; i++) await asRole("service_role", `select coderdojo.revoke_portal_for_kiosk('${AUTH}','${SESSION}')`);
  expect((await db.query("select * from coderdojo_private.kiosk_revoked_sessions")).rows).toHaveLength(1);
  expect((await db.query("select * from coderdojo.members")).rows).toEqual(before);
  expect((await db.query("select * from coderdojo.member_attendances")).rows).toHaveLength(0);
 });
});
