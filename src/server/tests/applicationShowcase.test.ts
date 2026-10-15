import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
let db: PGlite;
const owner: string = "00000000-0000-4000-8000-000000000001";
const other: string = "00000000-0000-4000-8000-000000000002";
const first: string = "00000000-0000-4000-8000-000000000003";
const second: string = "00000000-0000-4000-8000-000000000004";
const foreign: string = "00000000-0000-4000-8000-000000000005";
const definition: string = "00000000-0000-4000-8000-000000000006";
let application: string;
/** Execute the real atomic application function. */
async function action(
	kind: string,
	operation: string,
	id: string,
	fields: unknown,
	expected: unknown = {},
): Promise<string> {
	const result: Awaited<
		ReturnType<typeof db.query<{ value: { id: string } }>>
	> = await db.query("select coderdojo.coder_action($1,$2,$3,$4,$5,$6) value", [
		owner,
		operation,
		kind,
		id,
		JSON.stringify(fields),
		JSON.stringify(expected),
	]);
	return result.rows[0]!.value.id;
}
beforeAll(async (): Promise<void> => {
	db = new PGlite();
	await db.exec(
		readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"),
	);
	await db.exec(`create schema coderdojo_private;
 alter table storage.buckets add column name text;
 create function coderdojo_private.current_member_id() returns uuid language sql as $$select null::uuid$$;
 create function coderdojo_private.is_mentor() returns boolean language sql as $$select false$$;
 create function coderdojo_private.linked_child(uuid) returns boolean language sql as $$select false$$;
 insert into coderdojo.members(id,is_ninja) values('${owner}',true),('${other}',true);
 insert into coderdojo.badge_categories(id) values('${definition}');
 insert into coderdojo.badges(id,badge_category_id) values('${definition}','${definition}');
 insert into coderdojo.belts(id,color,sort_order) values('${definition}','white',1);`);
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261015074227_member_showcase.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261015102219_link_showcase_applications.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
	for (const [id, member] of [
		[first, owner],
		[second, owner],
		[foreign, other],
	])
		await db.query(
			"insert into coderdojo.member_showcase(id,member_id,title,description,project_type,url,is_visible) values($1,$2,'Game','Evidence','website','https://example.com',false)",
			[id, member],
		);
});
afterAll(async (): Promise<void> => {
	await db.close();
});
it("accepts ordered multiple hidden own projects and retains duplicate submission evidence", async (): Promise<void> => {
	application = await action("badge", "apply", definition, {
		notes: "First application",
		showcaseItemIds: [second, first],
	});
	expect(
		await action("badge", "apply", definition, {
			notes: "Duplicate application",
			showcaseItemIds: [],
		}),
	).toBe(application);
	const result = await db.query<{
		showcase_item_ids: string[];
		application_notes: string;
	}>(
		"select showcase_item_ids,application_notes from coderdojo.member_badges where id=$1",
		[application],
	);
	expect(result.rows[0]).toEqual({
		showcase_item_ids: [second, first],
		application_notes: "First application",
	});
});
it("rejects foreign, missing, duplicate and null project IDs", async (): Promise<void> => {
	for (const ids of [[foreign], [definition], [first, first], [null]])
		await expect(
			action("belt", "apply", definition, {
				notes: "Evidence notes",
				showcaseItemIds: ids,
			}),
		).rejects.toThrow();
});
it("guards pending edits with exact baseline and own application identity", async (): Promise<void> => {
	await action(
		"badge",
		"application-showcase",
		application,
		{ showcaseItemIds: [first] },
		{ showcaseItemIds: [second, first] },
	);
	await expect(
		action(
			"badge",
			"application-showcase",
			application,
			{ showcaseItemIds: [] },
			{ showcaseItemIds: [second, first] },
		),
	).rejects.toThrow("changed");
	await expect(
		action(
			"badge",
			"application-showcase",
			foreign,
			{ showcaseItemIds: [] },
			{ showcaseItemIds: [] },
		),
	).rejects.toThrow("Pending own");
});
it("prevents decided edits and creates fresh reapplications retaining history", async (): Promise<void> => {
	await db.query(
		"update coderdojo.member_badges set rejected_date=now(),rejected_notes='Try again' where id=$1",
		[application],
	);
	await expect(
		action(
			"badge",
			"application-showcase",
			application,
			{ showcaseItemIds: [] },
			{ showcaseItemIds: [first] },
		),
	).rejects.toThrow("Pending own");
	const next: string = await action("badge", "apply", definition, {
		notes: "New application",
		showcaseItemIds: [second, first],
	});
	expect(next).not.toBe(application);
});
it("deletion cleans badge and belt history for the owner, preserving other links and notes", async (): Promise<void> => {
	const belt: string = await action("belt", "apply", definition, {
		notes: "Belt evidence",
		showcaseItemIds: [second, first],
	});
	await db.query(
		"update coderdojo.member_belts set awarded=now(),awarded_notes='Approved' where id=$1",
		[belt],
	);
	// Legacy malformed references in another member's records must not be touched by owner-scoped deletion.
	await db.query(
		"insert into coderdojo.member_badges(member_id,badge_id,showcase_item_ids) values($1,$2,$3)",
		[other, definition, [first]],
	);
	await db.query("delete from coderdojo.member_showcase where id=$1", [first]);
	expect(
		(
			await db.query(
				"select showcase_item_ids,application_notes,awarded_notes from coderdojo.member_belts where id=$1",
				[belt],
			)
		).rows[0],
	).toEqual({
		showcase_item_ids: [second],
		application_notes: "Belt evidence",
		awarded_notes: "Approved",
	});
	expect(
		(
			await db.query(
				"select showcase_item_ids from coderdojo.member_badges where id=$1",
				[application],
			)
		).rows[0],
	).toEqual({ showcase_item_ids: [] });
	expect(
		(
			await db.query(
				"select showcase_item_ids from coderdojo.member_badges where member_id=$1",
				[other],
			)
		).rows[0],
	).toEqual({ showcase_item_ids: [first] });
});
it("read repair removes already missing IDs without losing valid current additions", async (): Promise<void> => {
	await db.query(
		"update coderdojo.member_badges set showcase_item_ids=$1 where id=$2",
		[[first, second], application],
	);
	await db.query("select coderdojo.repair_application_showcase('badge',$1)", [
		owner,
	]);
	expect(
		(
			await db.query(
				"select showcase_item_ids from coderdojo.member_badges where id=$1",
				[application],
			)
		).rows[0],
	).toEqual({ showcase_item_ids: [second] });
	await db.query("select coderdojo.repair_application_showcase('badge',$1)", [
		owner,
	]);
	expect(
		(
			await db.query(
				"select showcase_item_ids from coderdojo.member_badges where id=$1",
				[application],
			)
		).rows[0],
	).toEqual({ showcase_item_ids: [second] });
});
it("keeps repair and coder mutations inaccessible to public roles", async (): Promise<void> => {
	expect(
		(
			await db.query(
				"select has_function_privilege('authenticated','coderdojo.repair_application_showcase(text,uuid)','EXECUTE') allowed",
			)
		).rows[0],
	).toEqual({ allowed: false });
	expect(
		(
			await db.query(
				"select has_function_privilege('anon','coderdojo.coder_action(uuid,text,text,uuid,jsonb,jsonb)','EXECUTE') allowed",
			)
		).rows[0],
	).toEqual({ allowed: false });
});

it("allows an open editor to remove another link after an old reference disappeared", async (): Promise<void> => {
	const pending: Awaited<ReturnType<typeof db.query<{ id: string }>>> =
		await db.query(
			"select id from coderdojo.member_badges where member_id=$1 and rejected_date is null and application_date is not null",
			[owner],
		);
	await action(
		"badge",
		"application-showcase",
		pending.rows[0]!.id,
		{ showcaseItemIds: [first] },
		{ showcaseItemIds: [second, first] },
	);
	expect(
		(
			await db.query(
				"select showcase_item_ids from coderdojo.member_badges where id=$1",
				[pending.rows[0]!.id],
			)
		).rows[0],
	).toEqual({ showcase_item_ids: [] });
});
it("enforces non-null unique arrays at the database boundary", async (): Promise<void> => {
	await expect(
		db.query(
			"update coderdojo.member_badges set showcase_item_ids=$1 where id=$2",
			[[second, second], application],
		),
	).rejects.toThrow();
	await expect(
		db.query(
			"update coderdojo.member_badges set showcase_item_ids=$1 where id=$2",
			[[null], application],
		),
	).rejects.toThrow();
});
