import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const TABLES: string[] = ["members", "member_parents", "member_attendances", "member_badge_categories", "member_badges", "member_belts", "badge_categories", "badges", "belts", "teams", "sessions", "session_pods"];
let db: PGlite;
/** Generate distinct synthetic member, auth and entity UUIDs. */
function id(value: number): string { return `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`; }
/** Run one statement as a real database role with a synthetic JWT subject. */
async function asRole(role: string, member: number | null, sql: string): Promise<Record<string, unknown>[]> {
 await db.exec(`set role ${role}; set request.jwt.claim.sub = '${member === null ? "" : id(member + 100)}';`);
 try { return (await db.query<Record<string, unknown>>(sql)).rows; }
 finally { await db.exec("reset role;"); }
}
/** Read only IDs available through each table's actual SELECT policy. */
async function visible(table: string, member: number): Promise<string[]> {
 return (await asRole("authenticated", member, `select id from coderdojo.${table} order by id`)).map((row): string => String(row.id));
}

beforeAll(async (): Promise<void> => {
 db = new PGlite();
 await db.exec(readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"));
 await db.exec(readFileSync(new URL("../migrations/20261011202237_profile_login_editing.sql", import.meta.url), "utf8"));
 await db.exec(`
 insert into coderdojo.teams(id,team_name,notes) values('${id(201)}','A','private notes'),('${id(202)}','B','other notes');
 insert into coderdojo.members(id,name_first,login,is_mentor,is_parent,is_ninja,deleted,team_id,password_hash,nfc_tag,fingerprint_id) values
 ('${id(1)}','Mentor','mentor',true,false,false,false,null,'secret','device',1),
 ('${id(2)}','Parent','parent',false,true,false,false,null,'secret','device',2),
 ('${id(3)}','Child','child',false,false,true,false,'${id(201)}','secret','device',3),
 ('${id(4)}','Other','other',false,false,true,false,'${id(202)}','secret','device',4),
 ('${id(5)}','Peer','peer',false,false,true,false,'${id(201)}','secret','device',5),
 ('${id(6)}','Archived','archived',true,false,false,true,null,'secret','device',6),
 ('${id(7)}','Multi','multi',true,true,false,false,null,'secret','device',7),
 ('${id(8)}','No role','norole',false,false,false,false,null,'secret','device',8);
 `);
 for (let member: number = 1; member <= 8; member++) await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())", [id(member + 100), `${id(member)}@coderdojoennis.com`]);
 await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'unbound@example.test',now())", [id(109)]);
 await db.exec(`
 insert into coderdojo.member_parents(member_id,parent_id) values('${id(3)}','${id(2)}'),('${id(3)}','${id(7)}');
 insert into coderdojo.badge_categories(id,category_name,deleted) values('${id(301)}','Active',false),('${id(302)}','Historical',true),('${id(303)}','Unrelated',true);
 insert into coderdojo.badges(id,badge_category_id,deleted) values('${id(311)}','${id(301)}',false),('${id(312)}','${id(302)}',true),('${id(313)}','${id(303)}',true);
 insert into coderdojo.belts(id,color,deleted) values('${id(321)}','Active',false),('${id(322)}','History',true),('${id(323)}','Unrelated',true);
 insert into coderdojo.member_badges(id,member_id,badge_id,application_notes) values('${id(331)}','${id(3)}','${id(312)}','private evidence'),('${id(332)}','${id(4)}','${id(313)}','other evidence');
 insert into coderdojo.member_belts(id,member_id,belt_id,application_notes) values('${id(341)}','${id(3)}','${id(322)}','private evidence'),('${id(342)}','${id(4)}','${id(323)}','other evidence');
 insert into coderdojo.member_attendances(id,member_id,date) values('${id(351)}','${id(3)}','2026-01-01'),('${id(352)}','${id(4)}','2026-02-01');
 insert into coderdojo.member_badge_categories(id,member_id,badge_category_id) values('${id(361)}','${id(1)}','${id(301)}');
 insert into coderdojo.sessions(id,session_date) values('${id(371)}','2026-01-01'),('${id(372)}','2026-02-01');
 insert into coderdojo.session_pods(id,session_date,mentors_only,ends_at,deleted) values
 ('${id(381)}',current_date,false,now()+interval '1 day',false),('${id(382)}',current_date,true,now()+interval '1 day',false),
 ('${id(383)}',current_date,false,now()-interval '1 second',false),('${id(384)}',current_date,false,now()+interval '1 day',true),
 ('${id(385)}',(now() at time zone 'Europe/Dublin')::date,false,null,false),('${id(386)}',(now() at time zone 'Europe/Dublin')::date-1,false,null,false);
 `);
 await db.exec(readFileSync(new URL("../migrations/20261012181831_f01_role_based_rls.sql", import.meta.url), "utf8"));
}, 30_000);
afterAll(async (): Promise<void> => { await db?.close(); });

describe("F01 actual PostgreSQL roles, grants and policies", (): void => {
 it.each(TABLES)("enables RLS and denies all direct writes on %s", async (table: string): Promise<void> => {
  const result: Record<string, unknown>[] = (await db.query<Record<string, unknown>>(`select relrowsecurity from pg_class where oid='coderdojo.${table}'::regclass`)).rows;
  expect(result[0]?.relrowsecurity).toBe(true);
  for (const member of [1,2,3,4,6,7,8,9]) {
   for (const query of [`update coderdojo.${table} set id=id`, `delete from coderdojo.${table}`, `insert into coderdojo.${table}(id) values('${id(999)}')`]) {
    await expect(asRole("authenticated",member,query)).rejects.toMatchObject({ code: "42501" });
   }
  }
  for (const operation of ["INSERT","UPDATE","DELETE","TRUNCATE","REFERENCES","TRIGGER"]) {
   expect((await db.query<{allowed:boolean}>(`select has_table_privilege('anon','coderdojo.${table}','${operation}') or has_table_privilege('authenticated','coderdojo.${table}','${operation}') as allowed`)).rows[0]?.allowed).toBe(false);
  }
 });
 it("does not confuse auth UUIDs with member UUIDs or editable metadata", async (): Promise<void> => {
  expect(await visible("members",3)).toEqual([id(3)]);
  expect(await asRole("service_role",null,`select coderdojo.resolve_member_identity('${id(103)}') as id`)).toEqual([{id:id(3)}]);
  await db.exec(`update auth.users set email='changed@example.test' where id='${id(103)}';`);
  expect(await visible("members",3)).toEqual([id(3)]);
 });
 it.each(TABLES)("denies private access to unbound/archived/roleless actors on %s", async (table: string): Promise<void> => {
  for (const member of [6,8,9]) expect(await visible(table,member)).toEqual([]);
 });
 it("denies anonymous auth identities even if a binding exists", async (): Promise<void> => {
  await db.exec(`update auth.users set is_anonymous=true where id='${id(103)}';`);
  expect(await visible("members",3)).toEqual([]);
  expect(await asRole("service_role",null,`select coderdojo.resolve_member_identity('${id(103)}') as id`)).toEqual([{id:null}]);
  await db.exec(`update auth.users set is_anonymous=false where id='${id(103)}';`);
 });
 it("gives mentors all active/archived rows and combines multiple roles", async (): Promise<void> => {
  expect(await visible("members",1)).toHaveLength(8);
  expect(await visible("members",7)).toHaveLength(8);
  expect(await visible("session_pods",1)).toHaveLength(6);
 });
 it("keeps parent raw member reads narrow while permitting linked history", async (): Promise<void> => {
  expect(await visible("members",2)).toEqual([id(2)]);
  expect(await visible("member_attendances",2)).toEqual([id(351)]);
  expect(await visible("member_badges",2)).toEqual([id(331)]);
  expect(await visible("member_belts",2)).toEqual([id(341)]);
  expect(await visible("member_parents",2)).toHaveLength(1);
  expect(await visible("teams",2)).toEqual([id(201)]);
  expect(await visible("sessions",2)).toEqual([id(371)]);
  expect(await visible("member_badge_categories",2)).toEqual([]);
 });
 it("restricts own/history definitions and public active definitions", async (): Promise<void> => {
  expect(await visible("member_badges",3)).toEqual([id(331)]);
  expect(await visible("member_badges",5)).toEqual([]);
  expect(await visible("badges",3)).toEqual([id(311),id(312)]);
  expect(await visible("badges",4)).toEqual([id(311),id(313)]);
  expect(await visible("badge_categories",2)).toEqual([id(301),id(302)]);
  expect(await asRole("anon",null,"select id from coderdojo.badges")).toEqual([{id:id(311)}]);
  await expect(asRole("anon",null,"select id from coderdojo.members")).rejects.toMatchObject({code:"42501"});
 });
 it("protects credential/device/team-note columns for every browser role", async (): Promise<void> => {
  for (const member of [1,2,3,7]) {
   for (const column of ["password_hash","nfc_tag","fingerprint_id"]) await expect(asRole("authenticated",member,`select ${column} from coderdojo.members`)).rejects.toMatchObject({code:"42501"});
   await expect(asRole("authenticated",member,"select notes from coderdojo.teams")).rejects.toMatchObject({code:"42501"});
  }
 });
 it("filters archived/private/expired pods using end-time and Dublin-day fallback", async (): Promise<void> => {
  expect(await visible("session_pods",3)).toEqual([id(381),id(385)]);
 });
 it("rechecks role/link/archive changes with the same JWT", async (): Promise<void> => {
  await db.exec(`update coderdojo.members set is_mentor=false where id='${id(1)}';`);
  expect(await visible("members",1)).toEqual([]);
  await db.exec(`update coderdojo.members set is_mentor=true where id='${id(1)}'; delete from coderdojo.member_parents where parent_id='${id(2)}';`);
  expect(await visible("member_attendances",2)).toEqual([]);
  await db.exec(`insert into coderdojo.member_parents(member_id,parent_id) values('${id(3)}','${id(2)}'); update coderdojo.members set deleted=true where id='${id(3)}';`);
  expect(await visible("member_badges",2)).toEqual([]);
  await db.exec(`update coderdojo.members set deleted=false where id='${id(3)}';`);
 });
 it("denies browser RPC execution and binding reads/writes", async (): Promise<void> => {
  for (const role of ["anon","authenticated"]) {
   for (const query of ["select coderdojo.get_attendance_stats()",`select coderdojo.resolve_member_identity('${id(101)}')`,`select coderdojo.ensure_member_auth_binding('${id(101)}','${id(1)}')`,"select * from coderdojo_private.member_auth_bindings"]) await expect(asRole(role,3,query)).rejects.toMatchObject({code:"42501"});
  }
  await expect(asRole("service_role",null,`select coderdojo.ensure_member_auth_binding('${id(103)}','${id(4)}')`)).rejects.toMatchObject({code:"42501"});
 });
 it("preserves guarded self profile save, stale checks and protected-field rejection", async (): Promise<void> => {
  const fields: Record<string,string|null> = {login:"child",name_first:"Child",name_last:null,email:null,phone:null,github_login:null,scratch_name:null,xbox_gamertag:null};
  const values: string = JSON.stringify({...fields,name_first:"Updated"}).replaceAll("'","''");
  const expected: string = JSON.stringify(fields);
  await asRole("service_role",null,`select coderdojo.save_profile('${id(3)}','${id(3)}','${values}','${expected}')`);
  await expect(asRole("service_role",null,`select coderdojo.save_profile('${id(3)}','${id(3)}','${values}','${expected}')`)).rejects.toMatchObject({code:"P0001"});
  await expect(asRole("service_role",null,`select coderdojo.save_profile('${id(3)}','${id(3)}','${JSON.stringify({...fields,is_mentor:true})}','${expected}')`)).rejects.toMatchObject({code:"22023"});
 });
 it("removes only application raw publications and preserves public bucket metadata", async (): Promise<void> => {
  expect((await db.query("select tablename from pg_publication_tables where schemaname='coderdojo'")).rows).toEqual([]);
  expect((await db.query("select tablename from pg_publication_tables where schemaname='other_app'")).rows).toHaveLength(1);
  expect((await db.query("select * from storage.buckets order by id")).rows).toEqual([{id:"coderdojo",public:true},{id:"monkeyschool",public:true}]);
 });
 it("uses row-free scoped messages, prevents client sends and keeps transaction rollback atomic", async (): Promise<void> => {
  await db.exec("truncate realtime.messages;");
  await db.exec(`update coderdojo.member_attendances set date='2026-01-02' where id='${id(351)}';`);
  const messages: {topic:string;payload:unknown}[] = (await db.query<{topic:string;payload:unknown}>("select topic,payload from realtime.messages")).rows;
  expect(messages.map((m):string=>m.topic).sort()).toEqual([1,2,3,7].map((n):string=>`coderdojo:member:${id(n)}`).sort());
  for (const message of messages) expect(message.payload).toEqual({table:"member_attendances",operation:"UPDATE"});
  expect(await asRole("authenticated",3,"select topic from realtime.messages")).toEqual([{topic:`coderdojo:member:${id(3)}`}]);
  expect(await asRole("authenticated",4,"select topic from realtime.messages")).toEqual([]);
  await expect(asRole("authenticated",3,`select realtime.send('{}','invalidate','coderdojo:member:${id(3)}',true)`)).rejects.toMatchObject({code:"42501"});
  const count: number = messages.length;
  await db.exec(`begin; delete from coderdojo.member_attendances where id='${id(351)}'; rollback;`);
  expect((await db.query("select * from realtime.messages")).rows).toHaveLength(count);
 });
 it("denies object mutations and listing without changing unrelated storage policy scope", async (): Promise<void> => {
  await expect(asRole("authenticated",3,"insert into storage.objects(bucket_id,name) values('coderdojo','Members/Photos/forged.png')")).rejects.toMatchObject({code:"42501"});
  expect(await asRole("anon",null,"select * from storage.objects")).toEqual([]);
  const policies: {qual:string;with_check:string}[] = (await db.query<{qual:string;with_check:string}>("select qual,with_check from pg_policies where schemaname='storage'")).rows;
  expect(policies).toHaveLength(4);
  for (const policy of policies) expect(`${policy.qual} ${policy.with_check}`).toContain("bucket_id <> 'coderdojo'");
 });
});
