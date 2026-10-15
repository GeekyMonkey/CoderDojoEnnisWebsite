import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
let db: PGlite;
const owner: string = "00000000-0000-4000-8000-000000000001";
const other: string = "00000000-0000-4000-8000-000000000002";
const item: string = "00000000-0000-4000-8000-000000000003";
beforeAll(async (): Promise<void> => {
	db = new PGlite();
	await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema coderdojo; create schema coderdojo_private; create schema realtime; create schema storage;
 create table coderdojo.members(id uuid primary key,deleted boolean default false,github_login text,scratch_name text,login text,name_first text,name_last text,has_avatar boolean,has_photo boolean,is_ninja boolean,is_parent boolean,is_mentor boolean);
 create table storage.buckets(id text primary key,name text,public boolean);
 create function coderdojo_private.current_member_id() returns uuid language sql as $$select nullif(current_setting('test.member',true),'')::uuid$$;
 create function coderdojo_private.is_mentor() returns boolean language sql as $$select coalesce(current_setting('test.mentor',true),'false')='true'$$;
 create function coderdojo_private.linked_child(uuid) returns boolean language sql as $$select coalesce(current_setting('test.parent',true),'false')='true'$$;
 create function realtime.send(jsonb,text,text,boolean) returns void language sql as $$ select $$;
 grant usage on schema coderdojo,coderdojo_private to anon,authenticated,service_role;
 insert into coderdojo.members(id,github_login) values('${owner}','octocat'),('${other}',null);`);
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261015074227_member_showcase.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
});
afterAll(async (): Promise<void> => {
	await db.close();
});
describe("showcase database permissions", (): void => {
	it("allows owner writes and anonymous reads including hidden rows", async (): Promise<void> => {
		await db.exec(
			`set role authenticated; set test.member='${owner}'; insert into coderdojo.member_showcase(id,member_id,title,description,project_type,url,is_visible) values('${item}','${owner}','Game','Play','scratch','https://scratch.mit.edu/projects/1',false); reset role; set role anon;`,
		);
		expect(
			(await db.query("select title from coderdojo.member_showcase")).rows,
		).toEqual([{ title: "Game" }]);
		await db.exec("reset role");
	});
	it("denies unrelated writes and ownership transfer", async (): Promise<void> => {
		await db.exec(`set role authenticated; set test.member='${other}'`);
		expect(
			(
				await db.query(
					"update coderdojo.member_showcase set title='Stolen' returning id",
				)
			).rows,
		).toEqual([]);
		await db.exec(`set test.member='${owner}'`);
		await expect(
			db.exec(`update coderdojo.member_showcase set member_id='${other}'`),
		).rejects.toThrow("immutable");
		await db.exec("reset role");
	});
	it("allows linked parents and mentors to update", async (): Promise<void> => {
		await db.exec(
			`set role authenticated; set test.member='${other}'; set test.parent='true'`,
		);
		expect(
			(
				await db.query(
					"update coderdojo.member_showcase set title='Parent edit' returning title",
				)
			).rows,
		).toEqual([{ title: "Parent edit" }]);
		await db.exec("set test.parent='false'; set test.mentor='true'");
		expect(
			(
				await db.query(
					"update coderdojo.member_showcase set title='Mentor edit' returning title",
				)
			).rows,
		).toEqual([{ title: "Mentor edit" }]);
		await db.exec("reset role; set test.mentor='false'");
	});
	it("queues thumbnails on replacement and deletion, including cascades", async (): Promise<void> => {
		const imageItem: string = "00000000-0000-4000-8000-000000000004";
		const first: string = `${imageItem}-ver1.png`;
		const second: string = `${imageItem}-ver2.png`;
		await db.query(
			"insert into coderdojo.member_showcase(id,member_id,title,description,project_type,url,thumbnail_path,thumbnail_version) values($1,$2,'Image','Image','website','https://example.org',$3,1)",
			[imageItem, owner, first],
		);
		await db.query(
			"update coderdojo.member_showcase set thumbnail_path=$1,thumbnail_version=2 where id=$2",
			[second, imageItem],
		);
		expect(
			(
				await db.query<{ path: string }>(
					"select * from coderdojo.showcase_cleanup_paths()",
				)
			).rows.map((row: { path: string }): string => row.path),
		).toEqual([first]);
		await db.query("delete from coderdojo.member_showcase where id=$1", [
			imageItem,
		]);
		expect(
			(
				await db.query<{ path: string }>(
					"select * from coderdojo.showcase_cleanup_paths()",
				)
			).rows.map((row: { path: string }): string => row.path),
		).toEqual([first, second]);
		await db.query("select coderdojo.ack_showcase_cleanup($1::text[])", [
			[first, second],
		]);
		expect(
			(await db.query("select * from coderdojo.showcase_cleanup_paths()")).rows,
		).toEqual([]);
	});
	it("blocks GitHub publication without evidence, then hides after username changes", async (): Promise<void> => {
		await expect(
			db.exec(
				"update coderdojo.member_showcase set project_type='github_profile',is_visible=true",
			),
		).rejects.toThrow("Validate");
		await db.exec(
			`select coderdojo.record_showcase_validation('${item}','octocat','https://octocat.github.io/'); update coderdojo.member_showcase set project_type='github_profile',url='https://octocat.github.io/',is_visible=true; update coderdojo.members set github_login='changed' where id='${owner}'`,
		);
		expect(
			(await db.query("select is_visible from coderdojo.member_showcase")).rows,
		).toEqual([{ is_visible: false }]);
	});
	it("uses public image storage and queues thumbnails on member deletion", async (): Promise<void> => {
		const member: string = "00000000-0000-4000-8000-000000000011";
		const entry: string = "00000000-0000-4000-8000-000000000012";
		const image: string = `${entry}-ver1.png`;
		expect(
			(await db.query("select public from storage.buckets where id='showcase'"))
				.rows,
		).toEqual([{ public: true }]);
		await db.query("insert into coderdojo.members(id) values($1)", [member]);
		await db.query(
			"insert into coderdojo.member_showcase(id,member_id,title,description,project_type,url,thumbnail_path,thumbnail_version) values($1,$2,'Game','Play','website','https://example.org',$3,1)",
			[entry, member, image],
		);
		await db.query("delete from coderdojo.members where id=$1", [member]);
		expect(
			(
				await db.query<{ path: string }>(
					"select * from coderdojo.showcase_cleanup_paths()",
				)
			).rows.map((row: { path: string }): string => row.path),
		).toContain(image);
	});
	it("reserves increasing per-item image versions without reusing a failed upload name", async (): Promise<void> => {
		const entry: string = "00000000-0000-4000-8000-000000000031";
		await db.exec(`set role authenticated; set test.member='${owner}'`);
		const first: { version: number }[] = (
			await db.query<{ version: number }>(
				"select coderdojo.reserve_showcase_thumbnail_version($1,$2) as version",
				[entry, owner],
			)
		).rows;
		const second: { version: number }[] = (
			await db.query<{ version: number }>(
				"select coderdojo.reserve_showcase_thumbnail_version($1,$2) as version",
				[entry, owner],
			)
		).rows;
		expect(first).toEqual([{ version: 1 }]);
		expect(second).toEqual([{ version: 2 }]);
		await expect(
			db.query("select coderdojo.reserve_showcase_thumbnail_version($1,$2)", [
				entry,
				other,
			]),
		).rejects.toThrow("access denied");
		await db.exec("reset role");
	});
});
