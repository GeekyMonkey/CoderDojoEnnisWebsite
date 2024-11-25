import {
	boolean,
	date,
	foreignKey,
	index,
	integer,
	pgSchema,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const coderdojo = pgSchema("coderdojo");

export const belts = coderdojo.table("belts", {
	id: uuid().primaryKey().notNull(),
	deleted: boolean().default(false).notNull(),
	color: text(),
	hexCode: text("hex_code"),
	description: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
});

export const badgeCategories = coderdojo.table("badge_categories", {
	id: uuid().primaryKey().notNull(),
	deleted: boolean().default(false).notNull(),
	categoryName: text("category_name"),
	categoryDescription: text("category_description"),
});

export const badges = coderdojo.table(
	"badges",
	{
		id: uuid().primaryKey().notNull(),
		deleted: boolean().default(false).notNull(),
		achievement: text(),
		badgeCategoryId: uuid("badge_category_id"),
		description: text(),
	},
	(table) => {
		return {
			badgesBadgeCategoryIdFkey: foreignKey({
				columns: [table.badgeCategoryId],
				foreignColumns: [badgeCategories.id],
				name: "badges_badge_category_id_fkey",
			}).onDelete("set null"),
		};
	},
);

export const teams = coderdojo.table("teams", {
	id: uuid().primaryKey().notNull(),
	deleted: boolean().default(false).notNull(),
	goal: text(),
	hexcode: text(),
	notes: text(),
	teamName: text("team_name").notNull(),
});

export const members = coderdojo.table(
	"members",
	{
		id: uuid().primaryKey().notNull(),
		birthYear: integer("birth_year"),
		deleted: boolean().default(false).notNull(),
		email: text(),
		fingerprintId: integer("fingerprint_id"),
		gardaVetted: boolean("garda_vetted").default(false).notNull(),
		githubLogin: text("github_login"),
		goalLongTerm: text("goal_long_term"),
		goalShortTerm: text("goal_short_term"),
		isMentor: boolean("is_mentor").default(false).notNull(),
		isNinja: boolean("is_ninja").default(false).notNull(),
		isParent: boolean("is_parent").default(false).notNull(),
		login: text(),
		loginDate: timestamp("login_date", { mode: "string" }),
		loginDatePrevious: timestamp("login_date_previous", { mode: "string" }),
		nameFirst: text("name_first"),
		nameLast: text("name_last"),
		passwordHash1: text("password_hash1"),
		phone: text(),
		registeredCurrentTerm: boolean("registered_current_term")
			.default(false)
			.notNull(),
		scratchName: text("scratch_name"),
		teamId: uuid("team_id"),
		xboxGamertag: text("xbox_gamertag"),
		passwordHash: text("password_hash"),
	},
	(table) => {
		return {
			membersTeamIdFkey: foreignKey({
				columns: [table.teamId],
				foreignColumns: [teams.id],
				name: "members_team_id_fkey",
			}).onDelete("set null"),
		};
	},
);

export const sessions = coderdojo.table(
	"sessions",
	{
		id: uuid().primaryKey().notNull(),
		createdDate: timestamp("created_date", { mode: "string" })
			.defaultNow()
			.notNull(),
		endDate: timestamp("end_date", { mode: "string" }),
		url: text(),
		topic: text(),
		adultId: uuid("adult_id"),
		adult2Id: uuid("adult2_id"),
		mentorsOnly: boolean("mentors_only").default(false).notNull(),
	},
	(table) => {
		return {
			sessionsAdult2IdFkey: foreignKey({
				columns: [table.adult2Id],
				foreignColumns: [members.id],
				name: "sessions_adult2_id_fkey",
			}).onDelete("set null"),
			sessionsAdultIdFkey: foreignKey({
				columns: [table.adultId],
				foreignColumns: [members.id],
				name: "sessions_adult_id_fkey",
			}).onDelete("set null"),
		};
	},
);

export const memberAttendances = coderdojo.table(
	"member_attendances",
	{
		id: uuid().primaryKey().notNull(),
		memberId: uuid("member_id"),
		date: date(),
	},
	(table) => {
		return {
			dateIdx: index("member_attendances_date_idx").using(
				"btree",
				table.date.asc().nullsLast().op("date_ops"),
			),
			memberAttendancesMemberIdFkey: foreignKey({
				columns: [table.memberId],
				foreignColumns: [members.id],
				name: "member_attendances_member_id_fkey",
			}).onDelete("cascade"),
		};
	},
);

export const memberBadgeCategories = coderdojo.table(
	"member_badge_categories",
	{
		id: uuid().primaryKey().notNull(),
		memberId: uuid("member_id"),
		badgeCategoryId: uuid("badge_category_id"),
	},
	(table) => {
		return {
			memberBadgeCategoriesBadgeCategoryIdFkey: foreignKey({
				columns: [table.badgeCategoryId],
				foreignColumns: [badgeCategories.id],
				name: "member_badge_categories_badge_category_id_fkey",
			}).onDelete("cascade"),
			memberBadgeCategoriesMemberIdFkey: foreignKey({
				columns: [table.memberId],
				foreignColumns: [members.id],
				name: "member_badge_categories_member_id_fkey",
			}).onDelete("cascade"),
		};
	},
);

export const memberParents = coderdojo.table(
	"member_parents",
	{
		id: uuid().primaryKey().notNull(),
		memberId: uuid("member_id"),
		parentId: uuid("parent_id"),
	},
	(table) => {
		return {
			memberParentsMemberIdFkey: foreignKey({
				columns: [table.memberId],
				foreignColumns: [members.id],
				name: "member_parents_member_id_fkey",
			}).onDelete("cascade"),
			memberParentsParentIdFkey: foreignKey({
				columns: [table.parentId],
				foreignColumns: [members.id],
				name: "member_parents_parent_id_fkey",
			}).onDelete("cascade"),
		};
	},
);

export const memberBelts = coderdojo.table(
	"member_belts",
	{
		id: uuid().primaryKey().notNull(),
		memberId: uuid("member_id"),
		beltId: uuid("belt_id"),
		awardedByAdultId: uuid("awarded_by_adult_id"),
		applicationNotes: text("application_notes"),
		awardedNotes: text("awarded_notes"),
		rejectedByAdultId: uuid("rejected_by_adult_id"),
		rejectedNotes: text("rejected_notes"),
		applicationDate: timestamp("application_date", { mode: "string" }),
		awarded: timestamp({ mode: "string" }),
		rejectedDate: timestamp("rejected_date", { mode: "string" }),
	},
	(table) => {
		return {
			memberBeltsAwardedByAdultIdFkey: foreignKey({
				columns: [table.awardedByAdultId],
				foreignColumns: [members.id],
				name: "member_belts_awarded_by_adult_id_fkey",
			}).onDelete("set null"),
			memberBeltsBeltIdFkey: foreignKey({
				columns: [table.beltId],
				foreignColumns: [belts.id],
				name: "member_belts_belt_id_fkey",
			}).onDelete("cascade"),
			memberBeltsMemberIdFkey: foreignKey({
				columns: [table.memberId],
				foreignColumns: [members.id],
				name: "member_belts_member_id_fkey",
			}).onDelete("cascade"),
			memberBeltsRejectedByAdultIdFkey: foreignKey({
				columns: [table.rejectedByAdultId],
				foreignColumns: [members.id],
				name: "member_belts_rejected_by_adult_id_fkey",
			}).onDelete("set null"),
		};
	},
);

export const memberBadges = coderdojo.table(
	"member_badges",
	{
		id: uuid().primaryKey().notNull(),
		memberId: uuid("member_id"),
		badgeId: uuid("badge_id"),
		awardedByAdultId: uuid("awarded_by_adult_id"),
		applicationNotes: text("application_notes"),
		awardedNotes: text("awarded_notes"),
		rejectedByAdultId: uuid("rejected_by_adult_id"),
		rejectedNotes: text("rejected_notes"),
		applicationDate: timestamp("application_date", { mode: "string" }),
		awarded: timestamp({ mode: "string" }),
		rejectedDate: timestamp("rejected_date", { mode: "string" }),
		goalDate: timestamp("goal_date", { mode: "string" }),
	},
	(table) => {
		return {
			memberBadgesAwardedByAdultIdFkey: foreignKey({
				columns: [table.awardedByAdultId],
				foreignColumns: [members.id],
				name: "member_badges_awarded_by_adult_id_fkey",
			}).onDelete("set null"),
			memberBadgesBadgeIdFkey: foreignKey({
				columns: [table.badgeId],
				foreignColumns: [badges.id],
				name: "member_badges_badge_id_fkey",
			}).onDelete("cascade"),
			memberBadgesMemberIdFkey: foreignKey({
				columns: [table.memberId],
				foreignColumns: [members.id],
				name: "member_badges_member_id_fkey",
			}).onDelete("cascade"),
			memberBadgesRejectedByAdultIdFkey: foreignKey({
				columns: [table.rejectedByAdultId],
				foreignColumns: [members.id],
				name: "member_badges_rejected_by_adult_id_fkey",
			}).onDelete("set null"),
		};
	},
);
