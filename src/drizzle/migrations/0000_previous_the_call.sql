-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "coderdojo";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."belts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"color" text,
	"hex_code" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."badge_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"category_name" text,
	"category_description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."badges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"achievement" text,
	"badge_category_id" uuid,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"goal" text,
	"hexcode" text,
	"notes" text,
	"team_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"birth_year" integer,
	"deleted" boolean DEFAULT false NOT NULL,
	"email" text,
	"fingerprint_id" integer,
	"garda_vetted" boolean DEFAULT false NOT NULL,
	"github_login" text,
	"goal_long_term" text,
	"goal_short_term" text,
	"is_mentor" boolean DEFAULT false NOT NULL,
	"is_ninja" boolean DEFAULT false NOT NULL,
	"is_parent" boolean DEFAULT false NOT NULL,
	"login" text,
	"login_date" timestamp,
	"login_date_previous" timestamp,
	"name_first" text,
	"name_last" text,
	"password_hash" text,
	"phone" text,
	"registered_current_term" boolean DEFAULT false NOT NULL,
	"scratch_name" text,
	"team_id" uuid,
	"xbox_gamertag" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"url" text,
	"topic" text,
	"adult_id" uuid,
	"adult2_id" uuid,
	"mentors_only" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."member_attendances" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid,
	"date" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."member_badge_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid,
	"badge_category_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."member_parents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."member_belts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid,
	"belt_id" uuid,
	"awarded_by_adult_id" uuid,
	"application_notes" text,
	"awarded_notes" text,
	"rejected_by_adult_id" uuid,
	"rejected_notes" text,
	"application_date" timestamp,
	"awarded" timestamp,
	"rejected_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coderdojo"."member_badges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid,
	"badge_id" uuid,
	"awarded_by_adult_id" uuid,
	"application_notes" text,
	"awarded_notes" text,
	"rejected_by_adult_id" uuid,
	"rejected_notes" text,
	"application_date" timestamp,
	"awarded" timestamp,
	"rejected_date" timestamp,
	"goal_date" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."badges" ADD CONSTRAINT "badges_badge_category_id_fkey" FOREIGN KEY ("badge_category_id") REFERENCES "coderdojo"."badge_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."members" ADD CONSTRAINT "members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "coderdojo"."teams"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."sessions" ADD CONSTRAINT "sessions_adult2_id_fkey" FOREIGN KEY ("adult2_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."sessions" ADD CONSTRAINT "sessions_adult_id_fkey" FOREIGN KEY ("adult_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_attendances" ADD CONSTRAINT "member_attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badge_categories" ADD CONSTRAINT "member_badge_categories_badge_category_id_fkey" FOREIGN KEY ("badge_category_id") REFERENCES "coderdojo"."badge_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badge_categories" ADD CONSTRAINT "member_badge_categories_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_parents" ADD CONSTRAINT "member_parents_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_parents" ADD CONSTRAINT "member_parents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_belts" ADD CONSTRAINT "member_belts_awarded_by_adult_id_fkey" FOREIGN KEY ("awarded_by_adult_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_belts" ADD CONSTRAINT "member_belts_belt_id_fkey" FOREIGN KEY ("belt_id") REFERENCES "coderdojo"."belts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_belts" ADD CONSTRAINT "member_belts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_belts" ADD CONSTRAINT "member_belts_rejected_by_adult_id_fkey" FOREIGN KEY ("rejected_by_adult_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badges" ADD CONSTRAINT "member_badges_awarded_by_adult_id_fkey" FOREIGN KEY ("awarded_by_adult_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badges" ADD CONSTRAINT "member_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "coderdojo"."badges"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badges" ADD CONSTRAINT "member_badges_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "coderdojo"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coderdojo"."member_badges" ADD CONSTRAINT "member_badges_rejected_by_adult_id_fkey" FOREIGN KEY ("rejected_by_adult_id") REFERENCES "coderdojo"."members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_attendances_date_idx" ON "coderdojo"."member_attendances" USING btree ("date" date_ops);
*/
