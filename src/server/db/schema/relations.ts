// import { relations } from "drizzle-orm/relations";
// import {
// 	badgeCategories,
// 	badges,
// 	teams,
// 	members,
// 	sessions,
// 	memberAttendances,
// 	memberBadgeCategories,
// 	memberParents,
// 	memberBelts,
// 	belts,
// 	memberBadges,
// } from "./schemas";

// export const badgesRelations = relations(badges, ({ one, many }) => ({
// 	badgeCategories: one(badgeCategories, {
// 		fields: [badges.badgeCategoryId],
// 		references: [badgeCategories.id],
// 	}),
// 	memberBadges: many(memberBadges),
// }));

// export const badgeCategoriesRelations = relations(
// 	badgeCategories,
// 	({ many }) => ({
// 		badges: many(badges),
// 		memberBadgeCategories: many(memberBadgeCategories),
// 	}),
// );

// export const membersRelations = relations(members, ({ one, many }) => ({
// 	teams: one(teams, {
// 		fields: [members.teamId],
// 		references: [teams.id],
// 	}),
// 	sessions_adult2Id: many(sessions, {
// 		relationName: "sessions_adult2Id_members_id",
// 	}),
// 	sessions_adultId: many(sessions, {
// 		relationName: "sessions_adultId_members_id",
// 	}),
// 	memberAttendances: many(memberAttendances),
// 	memberBadgeCategories: many(memberBadgeCategories),
// 	memberParents_memberId: many(memberParents, {
// 		relationName: "memberParents_memberId_members_id",
// 	}),
// 	memberParents_parentId: many(memberParents, {
// 		relationName: "memberParents_parentId_members_id",
// 	}),
// 	memberBelts_awardedByAdultId: many(memberBelts, {
// 		relationName: "memberBelts_awardedByAdultId_members_id",
// 	}),
// 	memberBelts_memberId: many(memberBelts, {
// 		relationName: "memberBelts_memberId_members_id",
// 	}),
// 	memberBelts_rejectedByAdultId: many(memberBelts, {
// 		relationName: "memberBelts_rejectedByAdultId_members_id",
// 	}),
// 	memberBadges_awardedByAdultId: many(memberBadges, {
// 		relationName: "memberBadges_awardedByAdultId_members_id",
// 	}),
// 	memberBadges_memberId: many(memberBadges, {
// 		relationName: "memberBadges_memberId_members_id",
// 	}),
// 	memberBadges_rejectedByAdultId: many(memberBadges, {
// 		relationName: "memberBadges_rejectedByAdultId_members_id",
// 	}),
// }));

// export const teamsRelations = relations(teams, ({ many }) => ({
// 	members: many(members),
// }));

// export const sessionsRelations = relations(sessions, ({ one }) => ({
// 	members_adult2Id: one(members, {
// 		fields: [sessions.adult2Id],
// 		references: [members.id],
// 		relationName: "sessions_adult2Id_members_id",
// 	}),
// 	members_adultId: one(members, {
// 		fields: [sessions.adultId],
// 		references: [members.id],
// 		relationName: "sessions_adultId_members_id",
// 	}),
// }));

// export const memberAttendancesRelations = relations(
// 	memberAttendances,
// 	({ one }) => ({
// 		members: one(members, {
// 			fields: [memberAttendances.memberId],
// 			references: [members.id],
// 		}),
// 	}),
// );

// export const memberBadgeCategoriesRelations = relations(
// 	memberBadgeCategories,
// 	({ one }) => ({
// 		badgeCategories: one(badgeCategories, {
// 			fields: [memberBadgeCategories.badgeCategoryId],
// 			references: [badgeCategories.id],
// 		}),
// 		members: one(members, {
// 			fields: [memberBadgeCategories.memberId],
// 			references: [members.id],
// 		}),
// 	}),
// );

// export const memberParentsRelations = relations(memberParents, ({ one }) => ({
// 	members_memberId: one(members, {
// 		fields: [memberParents.memberId],
// 		references: [members.id],
// 		relationName: "memberParents_memberId_members_id",
// 	}),
// 	members_parentId: one(members, {
// 		fields: [memberParents.parentId],
// 		references: [members.id],
// 		relationName: "memberParents_parentId_members_id",
// 	}),
// }));

// export const memberBeltsRelations = relations(memberBelts, ({ one }) => ({
// 	members_awardedByAdultId: one(members, {
// 		fields: [memberBelts.awardedByAdultId],
// 		references: [members.id],
// 		relationName: "memberBelts_awardedByAdultId_members_id",
// 	}),
// 	belts: one(belts, {
// 		fields: [memberBelts.beltId],
// 		references: [belts.id],
// 	}),
// 	members_memberId: one(members, {
// 		fields: [memberBelts.memberId],
// 		references: [members.id],
// 		relationName: "memberBelts_memberId_members_id",
// 	}),
// 	members_rejectedByAdultId: one(members, {
// 		fields: [memberBelts.rejectedByAdultId],
// 		references: [members.id],
// 		relationName: "memberBelts_rejectedByAdultId_members_id",
// 	}),
// }));

// export const beltsRelations = relations(belts, ({ many }) => ({
// 	memberBelts: many(memberBelts),
// }));

// export const memberBadgesRelations = relations(memberBadges, ({ one }) => ({
// 	members_awardedByAdultId: one(members, {
// 		fields: [memberBadges.awardedByAdultId],
// 		references: [members.id],
// 		relationName: "memberBadges_awardedByAdultId_members_id",
// 	}),
// 	badges: one(badges, {
// 		fields: [memberBadges.badgeId],
// 		references: [badges.id],
// 	}),
// 	members_memberId: one(members, {
// 		fields: [memberBadges.memberId],
// 		references: [members.id],
// 		relationName: "memberBadges_memberId_members_id",
// 	}),
// 	members_rejectedByAdultId: one(members, {
// 		fields: [memberBadges.rejectedByAdultId],
// 		references: [members.id],
// 		relationName: "memberBadges_rejectedByAdultId_members_id",
// 	}),
// }));
