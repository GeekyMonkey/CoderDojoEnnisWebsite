import type { EventHandlerRequest, H3Event } from "h3";
import {
	type VexTaskModel,
	type VexTaskSaveModel,
	vexTaskFromRecord,
} from "#shared/types/models/VexTaskModel";
import { ErrorToString } from "#shared/utils/ErrorHelpers";
import type { Database } from "../../types/supabase";
import { GetSupabaseAdminClient } from "./DatabaseClient";

/**
 * Custom types for Supabase schema
 */
export type VexTaskRecord = Database["coderdojo"]["Tables"]["vex_tasks"]["Row"];
type VexTaskInsert = Database["coderdojo"]["Tables"]["vex_tasks"]["Insert"];
type VexTaskMemberRecord =
	Database["coderdojo"]["Tables"]["vex_task_members"]["Row"];
type VexTaskWithOwnersRecord = VexTaskRecord & {
	vex_task_members: Pick<VexTaskMemberRecord, "member_id">[] | null;
};

/**
 * Convert a task row with its embedded owner rows into a model
 */
function taskFromJoinedRecord(record: VexTaskWithOwnersRecord): VexTaskModel {
	const { vex_task_members: owners, ...task } = record;
	const ownerIds: string[] = (owners ?? []).map((o) => String(o.member_id));
	return vexTaskFromRecord(task as VexTaskRecord, ownerIds);
}

/**
 * Data for VEX sprint tasks (and their owners)
 */
export const VexTasksData = {
	/**
	 * Get tasks for one sprint, or for every sprint in a season
	 */
	GetTasks: async (
		event: H3Event<EventHandlerRequest>,
		filter: { sprintId?: string; seasonId?: string },
	): Promise<VexTaskModel[]> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}

		let sprintIds: string[] = [];
		if (filter.sprintId) {
			sprintIds = [filter.sprintId];
		} else if (filter.seasonId) {
			const { data: sprints, error: sprintsError } = await supabase
				.schema("coderdojo")
				.from("vex_sprints")
				.select("id")
				.eq("season_id", filter.seasonId)
				.eq("deleted", false);
			if (sprintsError) {
				throw new Error(
					`Error fetching VEX sprints: ${ErrorToString(sprintsError)}`,
				);
			}
			sprintIds = (sprints ?? []).map((s: { id: string }) => s.id);
		}
		if (sprintIds.length === 0) {
			return [];
		}

		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_tasks")
			.select("*, vex_task_members(member_id)")
			.in("sprint_id", sprintIds)
			.eq("deleted", false)
			.order("created_at", { ascending: true });
		if (error) {
			throw new Error(`Error fetching VEX tasks: ${ErrorToString(error)}`);
		}
		return ((data ?? []) as VexTaskWithOwnersRecord[]).map(
			taskFromJoinedRecord,
		);
	},

	/**
	 * Get one task by id (with owners)
	 */
	GetTaskById: async (
		event: H3Event<EventHandlerRequest>,
		taskId: string,
	): Promise<VexTaskModel | null> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_tasks")
			.select("*, vex_task_members(member_id)")
			.eq("id", taskId)
			.eq("deleted", false)
			.maybeSingle();
		if (error) {
			throw new Error(`Error fetching VEX task: ${ErrorToString(error)}`);
		}
		return data ? taskFromJoinedRecord(data as VexTaskWithOwnersRecord) : null;
	},

	/**
	 * Insert or update a task and replace its owner list
	 */
	SaveTask: async (
		event: H3Event<EventHandlerRequest>,
		task: VexTaskSaveModel,
		memberId: string,
	): Promise<VexTaskModel> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}

		const record: VexTaskInsert = {
			sprint_id: task.sprintId,
			title: task.title,
			notes: task.notes || null,
			link_url: task.linkUrl || null,
			status: task.status,
			updated_by_member_id: memberId,
		};
		if (task.id) {
			record.id = task.id;
		} else {
			record.created_by_member_id = memberId;
		}

		const { data, error } = await supabase
			.schema("coderdojo")
			.from("vex_tasks")
			.upsert(record, { onConflict: "id" })
			.select()
			.single();
		if (error || !data) {
			throw new Error(`Error saving VEX task: ${ErrorToString(error)}`);
		}
		const saved = data as VexTaskRecord;

		// Sync owners: remove those no longer listed, add new ones
		const ownerIds: string[] = Array.from(new Set(task.ownerMemberIds));
		const { data: existing, error: existingError } = await supabase
			.schema("coderdojo")
			.from("vex_task_members")
			.select("id, member_id")
			.eq("task_id", saved.id);
		if (existingError) {
			throw new Error(
				`Error fetching VEX task owners: ${ErrorToString(existingError)}`,
			);
		}
		const existingRows = (existing ?? []) as Pick<
			VexTaskMemberRecord,
			"id" | "member_id"
		>[];
		const toRemove: string[] = existingRows
			.filter((row) => !ownerIds.includes(row.member_id))
			.map((row) => row.id);
		const existingMemberIds: string[] = existingRows.map((r) => r.member_id);
		const toAdd = ownerIds
			.filter((id) => !existingMemberIds.includes(id))
			.map((id) => ({ task_id: saved.id, member_id: id }));

		if (toRemove.length > 0) {
			const { error: removeError } = await supabase
				.schema("coderdojo")
				.from("vex_task_members")
				.delete()
				.in("id", toRemove);
			if (removeError) {
				throw new Error(
					`Error removing VEX task owners: ${ErrorToString(removeError)}`,
				);
			}
		}
		if (toAdd.length > 0) {
			const { error: addError } = await supabase
				.schema("coderdojo")
				.from("vex_task_members")
				.insert(toAdd);
			if (addError) {
				throw new Error(
					`Error adding VEX task owners: ${ErrorToString(addError)}`,
				);
			}
		}

		return vexTaskFromRecord(saved, ownerIds);
	},

	/**
	 * Soft delete a task
	 */
	DeleteTask: async (
		event: H3Event<EventHandlerRequest>,
		taskId: string,
		memberId: string,
	): Promise<boolean> => {
		const supabase = await GetSupabaseAdminClient(event);
		if (!supabase) {
			throw new Error("Database unavailable");
		}
		const { error } = await supabase
			.schema("coderdojo")
			.from("vex_tasks")
			.update({ deleted: true, updated_by_member_id: memberId })
			.eq("id", taskId);
		if (error) {
			throw new Error(`Error deleting VEX task: ${ErrorToString(error)}`);
		}
		return true;
	},
};
