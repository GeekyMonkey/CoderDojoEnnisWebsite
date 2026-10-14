import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";

let db: PGlite;
const MENTOR: string = "00000000-0000-4000-8000-000000000001";
const CODER: string = "00000000-0000-4000-8000-000000000002";
const AUTH: string = "00000000-0000-4000-8000-000000000102";
type SessionRow = {
	id: string;
	revision: string;
	session_date: string;
	topic: string;
	description: string;
	deleted: boolean;
};
/** Read one saved session as the fixture owner. */
async function stored(id: string): Promise<SessionRow> {
	return (
		await db.query<SessionRow>("select * from coderdojo.sessions where id=$1", [
			id,
		])
	).rows[0]!;
}
/** Exercise the real service-only calendar transaction. */
async function write(
	action: string,
	id: string | null = null,
	expected: string | null = null,
	date: string = "2030-10-14",
	actor: string = MENTOR,
	privateSession: boolean = false,
): Promise<string> {
	await db.exec("set role service_role");
	try {
		const result: { result: { id: string } }[] = (
			await db.query<{ result: { id: string } }>(
				"select coderdojo.maintain_calendar_session($1,$2,$3,$4,$5) as result",
				[
					actor,
					action,
					id,
					{
						sessionDate: date,
						topic: "",
						description: "Starts at 11:00",
						sessionType: privateSession ? "MENTOR_PLANNING" : "CODING",
					},
					expected,
				],
			)
		).rows;
		return result[0]!.result.id;
	} finally {
		await db.exec("reset role");
	}
}

beforeAll(async (): Promise<void> => {
	db = new PGlite();
	await db.exec(
		readFileSync(new URL("./fixtures/f01_schema.sql", import.meta.url), "utf8"),
	);
	// Match the live function's table return type; the older shared fixture uses a scalar stub.
	await db.exec(
		"drop function coderdojo.get_attendance_stats(); create function coderdojo.get_attendance_stats() returns table(date text,attendance_count bigint) language sql as $$ select date::text,count(*) from coderdojo.member_attendances group by date $$;",
	);
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261012181831_f01_role_based_rls.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261014190639_member_calendar.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
	await db.exec(
		"insert into coderdojo.sessions(id,session_date,topic,description,mentors_only,deleted) values ('00000000-0000-4000-8000-000000000901','2030-01-01','Keep coding','Keep description',false,false),('00000000-0000-4000-8000-000000000902','2030-01-02','Keep planning','Keep private description',true,true)",
	);
	const before = (
		await db.query<{ id: string; revision: string }>(
			"select id,revision from coderdojo.sessions order by id",
		)
	).rows;
	await db.exec(
		readFileSync(
			new URL(
				"../migrations/20261014210009_calendar_entry_types.sql",
				import.meta.url,
			),
			"utf8",
		),
	);
	const after = (
		await db.query<{
			id: string;
			session_type: string;
			topic: string;
			description: string;
			deleted: boolean;
			revision: string;
		}>("select * from coderdojo.sessions order by id")
	).rows;
	expect(after).toMatchObject([
		{
			id: before[0]!.id,
			session_type: "CODING",
			topic: "Keep coding",
			description: "Keep description",
			deleted: false,
		},
		{
			id: before[1]!.id,
			session_type: "MENTOR_PLANNING",
			topic: "Keep planning",
			description: "Keep private description",
			deleted: true,
		},
	]);
	expect(after[0]!.revision).not.toBe(before[0]!.revision);
	expect(after[1]!.revision).not.toBe(before[1]!.revision);
	await db.exec("delete from coderdojo.sessions");

	const podSql: string = readFileSync(
		new URL(
			"../migrations/20261012094401_mentor_session_management.sql",
			import.meta.url,
		),
		"utf8",
	);
	for (const name of ["maintain_session_pod", "join_member_session"]) {
		const start: number = podSql.indexOf(
			`create or replace function coderdojo.${name}(`,
		);
		const end: number = podSql.indexOf("$$;", start) + 3;
		await db.exec(podSql.slice(start, end));
	}

	await db.query(
		"insert into coderdojo.members(id,name_first,is_mentor,is_ninja) values($1,'Mentor',true,false),($2,'Coder',false,true)",
		[MENTOR, CODER],
	);
	await db.query(
		"insert into auth.users(id,email) values($1,'coder@example.invalid')",
		[AUTH],
	);
	await db.query(
		"insert into coderdojo_private.member_auth_bindings values($1,$2)",
		[AUTH, CODER],
	);
}, 30_000);
beforeEach(async (): Promise<void> => {
	await db.exec(
		"reset role; delete from coderdojo.session_pods; delete from coderdojo.sessions; delete from coderdojo.member_attendances; delete from realtime.messages;",
	);
});
afterAll(async (): Promise<void> => {
	await db?.close();
});

describe("dated Calendar database behavior", (): void => {
	it("defaults the topic, allows duplicate dates and rejects stale saves, and keeps attendance unchanged", async (): Promise<void> => {
		const id: string = await write("create");
		const first: SessionRow = await stored(id);
		expect(first.topic).toBe("Coding Session");
		expect(await write("create")).not.toBe(id);
		await write("update", id, first.revision, "2030-10-15");
		await expect(write("update", id, first.revision)).rejects.toThrow(
			"changed",
		);
		await expect(write("delete", id, first.revision)).rejects.toThrow(
			"changed",
		);
		expect(
			(await db.query("select * from coderdojo.member_attendances")).rows,
		).toHaveLength(0);
	});
	it("soft-deletes, reuses a deleted date, and preserves historical attendance", async (): Promise<void> => {
		await db.query(
			"insert into coderdojo.member_attendances(member_id,date) values($1,'2020-01-01')",
			[CODER],
		);
		const id: string = await write("create", null, null, "2020-01-01");
		await write("delete", id, (await stored(id)).revision);
		expect((await stored(id)).deleted).toBe(true);
		expect(
			(await db.query("select * from coderdojo.member_attendances")).rows,
		).toHaveLength(1);
		expect(await write("create", null, null, "2020-01-01")).not.toBe(id);
		expect((await stored(id)).deleted).toBe(true);
	});
	it("denies non-mentor and archived-mentor mutations", async (): Promise<void> => {
		await expect(
			write("create", null, null, "2030-10-14", CODER),
		).rejects.toThrow("Mentor access");
		await db.query("update coderdojo.members set deleted=true where id=$1", [
			MENTOR,
		]);
		try {
			await expect(write("create")).rejects.toThrow("Mentor access");
		} finally {
			await db.query("update coderdojo.members set deleted=false where id=$1", [
				MENTOR,
			]);
		}
	});
	it("allows general calendar reads without attendance while hiding private/deleted rows through RLS", async (): Promise<void> => {
		const general: string = await write("create");
		await write("create", null, null, "2030-10-15", MENTOR, true);
		const removed: string = await write("create", null, null, "2030-10-16");
		await write("delete", removed, (await stored(removed)).revision);
		await db.exec(
			`set role authenticated; set request.jwt.claim.sub='${AUTH}';`,
		);
		try {
			expect(
				(
					await db.query<{ id: string }>("select id from coderdojo.sessions")
				).rows.map((row: { id: string }): string => row.id),
			).toEqual([general]);
			await expect(
				db.query("select coderdojo.maintain_calendar_session($1,'create')", [
					MENTOR,
				]),
			).rejects.toThrow("permission denied");
			await expect(
				db.query("update coderdojo.sessions set topic='forged'"),
			).rejects.toThrow("permission denied");
		} finally {
			await db.exec("reset role");
		}
	});
	it("merges cutover dates, preserving unmatched future sessions and avoiding imported-ID collisions", async (): Promise<void> => {
		const preserved: string = await write("create");
		const original: SessionRow = await stored(preserved);
		const replaced: string = await write("create", null, null, "2020-01-01");
		await db.query("select coderdojo.import_calendar_sessions($1)", [
			[
				{
					id: preserved,
					session_date: "2020-01-01",
					topic: "Imported",
					mentors_only: false,
				},
				{
					id: preserved,
					session_date: "2020-01-02",
					topic: "Imported new",
					mentors_only: false,
				},
			],
		]);
		expect(await stored(preserved)).toEqual(original);
		expect((await stored(replaced)).deleted).toBe(true);
		expect(
			(
				await db.query(
					"select topic from coderdojo.sessions where not deleted and session_date='2020-01-01'",
				)
			).rows,
		).toEqual([{ topic: "Imported" }]);
		expect(
			(await db.query("select * from coderdojo.sessions")).rows,
		).toHaveLength(4);
	});
	it("excludes future attendance from dates, stats and sign-in milestones, and rejects new future presence", async (): Promise<void> => {
		// Simulate a pre-existing bad row from before the new safeguard.
		await db.exec(
			"alter table coderdojo.member_attendances disable trigger reject_future_attendance;",
		);
		await db.query(
			"insert into coderdojo.member_attendances(member_id,date) values($1,'2099-01-01')",
			[CODER],
		);
		await db.exec(
			"alter table coderdojo.member_attendances enable trigger reject_future_attendance;",
		);
		await write("create");
		expect(
			(await db.query("select * from coderdojo.get_attendance_dates()")).rows,
		).toEqual([]);
		expect(
			(await db.query("select * from coderdojo.get_attendance_stats_split()"))
				.rows,
		).toEqual([]);
		expect(
			(await db.query("select * from coderdojo.get_attendance_stats()")).rows,
		).toEqual([]);
		await expect(
			db.query(
				"insert into coderdojo.member_attendances(member_id,date) values($1,'2099-01-02')",
				[CODER],
			),
		).rejects.toThrow("future date");
		const sql: string =
			"select coderdojo.sign_in_attendance($1,(now() at time zone 'Europe/Dublin')::date) as result";
		expect(
			(await db.query<{ result: { sessionCount: number } }>(sql, [CODER]))
				.rows[0]!.result.sessionCount,
		).toBe(1);
		expect(
			(await db.query<{ result: { sessionCount: number } }>(sql, [CODER]))
				.rows[0]!.result.sessionCount,
		).toBe(1);
		expect(
			(await db.query("select * from coderdojo.get_attendance_dates()")).rows,
		).toHaveLength(1);
	});
	it("sends only metadata invalidations for public changes and no private-only changes to coders", async (): Promise<void> => {
		await write("create", null, null, "2030-10-15", MENTOR, true);
		expect(
			(await db.query("select * from realtime.messages")).rows,
		).toHaveLength(0);
		await write("create");
		const messages: { payload: object }[] = (
			await db.query<{ payload: object }>(
				"select payload from realtime.messages",
			)
		).rows;
		expect(messages).toEqual([
			{ payload: { table: "sessions", operation: "INSERT" } },
		]);
	});
});

it("preserves pod host/expiry/private rules and idempotent attendance alongside future Calendar dates", async (): Promise<void> => {
	const fields: object = {
		topic: "Test pod",
		url: "https://example.invalid/dojo",
		hostId: MENTOR,
		host2Id: null,
		mentorsOnly: false,
	};
	const result: { id: string } = (
		await db.query<{ result: { id: string } }>(
			"select coderdojo.maintain_session_pod($1,'create',null,$2) as result",
			[MENTOR, fields],
		)
	).rows[0]!.result;
	const timing: { minutes: number } = (
		await db.query<{ minutes: number }>(
			"select round(extract(epoch from (ends_at-now()))/60)::int as minutes from coderdojo.session_pods where id=$1",
			[result.id],
		)
	).rows[0]!;
	expect(timing.minutes).toBe(150);
	await expect(
		db.query("select coderdojo.maintain_session_pod($1,'create',null,$2)", [
			MENTOR,
			{ ...fields, host2Id: MENTOR },
		]),
	).rejects.toThrow("distinct");
	await write("create");
	for (let count: number = 0; count < 2; count++)
		await db.query("select coderdojo.join_member_session($1,$2,$3)", [
			CODER,
			result.id,
			"https://example.invalid/dojo",
		]);
	expect(
		(await db.query("select * from coderdojo.member_attendances")).rows,
	).toHaveLength(1);
	await db.query(
		"update coderdojo.session_pods set mentors_only=true where id=$1",
		[result.id],
	);
	await expect(
		db.query("select coderdojo.join_member_session($1,$2,$3)", [
			CODER,
			result.id,
			"https://example.invalid/dojo",
		]),
	).rejects.toThrow("unavailable");
	await db.query(
		"update coderdojo.session_pods set ends_at=now()-interval '1 minute' where id=$1",
		[result.id],
	);
	await expect(
		db.query("select coderdojo.join_member_session($1,$2,$3)", [
			MENTOR,
			result.id,
			"https://example.invalid/dojo",
		]),
	).rejects.toThrow("ended");
});

it("publishes only coding and notes to anon, with no revisions or write permission", async (): Promise<void> => {
	const coding: string = await write("create");
	const note: string = (
		await db.query<{ id: string }>(
			"insert into coderdojo.sessions(session_date,session_type,topic) values('2030-10-14','NOTE','Announcement') returning id",
		)
	).rows[0]!.id;
	await write("create", null, null, "2030-10-14", MENTOR, true);
	await db.exec("set role anon");
	try {
		const rows: { id: string }[] = (
			await db.query<{ id: string }>(
				"select id,topic,session_type,description,session_date from coderdojo.sessions order by id",
			)
		).rows;
		expect(rows.map((row: { id: string }): string => row.id).sort()).toEqual(
			[coding, note].sort(),
		);
		await expect(
			db.query("select revision from coderdojo.sessions"),
		).rejects.toThrow("permission denied");
		await expect(
			db.query("select coderdojo.maintain_calendar_session($1,'create')", [
				MENTOR,
			]),
		).rejects.toThrow("permission denied");
		await expect(
			db.query(
				"insert into coderdojo.sessions(session_date) values('2030-10-14')",
			),
		).rejects.toThrow("permission denied");
	} finally {
		await db.exec("reset role");
	}
});
it("allows multiple entries of each type and preserves neighbours when editing", async (): Promise<void> => {
	for (const type of ["CODING", "MENTOR_PLANNING", "NOTE"])
		for (let count: number = 0; count < 2; count++)
			await db.query(
				"select coderdojo.maintain_calendar_session($1,'create',null,$2)",
				[
					MENTOR,
					{
						sessionDate: "2030-10-14",
						topic: "Entry",
						description: "",
						sessionType: type,
					},
				],
			);
	expect(
		(await db.query("select * from coderdojo.sessions")).rows,
	).toHaveLength(6);
	const first: SessionRow = (
		await db.query<SessionRow>(
			"select * from coderdojo.sessions order by id limit 1",
		)
	).rows[0]!;
	await write("delete", first.id, first.revision);
	expect(
		(await db.query("select * from coderdojo.sessions where not deleted")).rows,
	).toHaveLength(5);
});
it("preserves notes and planning on imported dates as well as multiple future coding entries", async (): Promise<void> => {
	await write("create");
	await write("create");
	await write("create", null, null, "2020-01-01", MENTOR, true);
	await db.query(
		"insert into coderdojo.sessions(session_date,session_type,topic) values('2020-01-01','NOTE','Keep me')",
	);
	await db.query("select coderdojo.import_calendar_sessions($1)", [
		[{ session_date: "2020-01-01", topic: "Imported" }],
	]);
	expect(
		(await db.query("select * from coderdojo.sessions where not deleted")).rows,
	).toHaveLength(5);
});

it("refreshes visibility when an entry changes type and preserves its neighbours", async (): Promise<void> => {
	const id: string = await write("create");
	const neighbour: string = await write("create");
	const original: SessionRow = await stored(id);
	await write("update", id, original.revision, "2030-10-14", MENTOR, true);
	await db.exec(`set role authenticated; set request.jwt.claim.sub='${AUTH}';`);
	try {
		expect(
			(await db.query<{ id: string }>("select id from coderdojo.sessions"))
				.rows,
		).toEqual([{ id: neighbour }]);
	} finally {
		await db.exec("reset role");
	}
	await expect(write("update", id, original.revision)).rejects.toThrow(
		"changed",
	);
	const privateRow: SessionRow = await stored(id);
	await db.query(
		"select coderdojo.maintain_calendar_session($1,'update',$2,$3,$4)",
		[
			MENTOR,
			id,
			{
				sessionDate: "2030-10-14",
				topic: "Announcement",
				description: "Keep this text",
				sessionType: "NOTE",
			},
			privateRow.revision,
		],
	);
	await db.exec("set role anon");
	try {
		expect(
			(
				await db.query<{ id: string }>(
					"select id from coderdojo.sessions order by id",
				)
			).rows
				.map((row): string => row.id)
				.sort(),
		).toEqual([id, neighbour].sort());
	} finally {
		await db.exec("reset role");
	}
	expect(await stored(neighbour)).toMatchObject({
		topic: "Coding Session",
		deleted: false,
	});
});
