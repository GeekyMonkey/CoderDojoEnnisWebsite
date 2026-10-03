import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { ComputedRef, Ref } from "vue";
import type {
	VexResourceModel,
	VexResourceSaveModel,
} from "#shared/types/models/VexResourceModel";
import type {
	VexSeasonModel,
	VexSeasonSaveModel,
} from "#shared/types/models/VexSeasonModel";
import type {
	VexSprintModel,
	VexSprintSaveModel,
} from "#shared/types/models/VexSprintModel";
import type {
	VexTaskModel,
	VexTaskSaveModel,
} from "#shared/types/models/VexTaskModel";
import type { SupabaseUserMetaType } from "#shared/types/Supabase";
import {
	VexFindCurrentSeason,
	VexFindCurrentSprint,
	VexSeasonSprints,
} from "#shared/utils/VexHelpers";
import { UseSupabaseClient } from "~/composables/UseSupabaseClient";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";

type FetchOptions = {
	method?: "GET" | "POST";
	body?: Record<string, unknown>;
	query?: Record<string, string>;
	signal?: AbortSignal;
};

const QUERY_KEYS = {
	resources: "vexResources",
	seasons: "vexSeasons",
	sprints: "vexSprints",
	tasks: "vexTasks",
} as const;

const TABLE_QUERY_KEYS: Record<string, string[]> = {
	vex_resources: [QUERY_KEYS.resources],
	vex_seasons: [QUERY_KEYS.seasons],
	vex_sprints: [QUERY_KEYS.sprints, QUERY_KEYS.tasks],
	vex_task_members: [QUERY_KEYS.tasks],
	vex_tasks: [QUERY_KEYS.tasks],
};

let isRealtimeWired: boolean = false;

/**
 * Client-side store for the VEX team workspace (seasons, sprints, tasks, resources)
 */
export function useVexStore() {
	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const { supabaseClient } = UseSupabaseClient();
	const user = useSupabaseUser();

	/**
	 * Call a VEX API with the member's access token
	 */
	async function vexFetch<T>(url: string, options: FetchOptions = {}) {
		const { data } = await supabaseClient.auth.getSession();
		const token: string = data.session?.access_token ?? "";
		const response = await $fetch<ApiResponse<T>>(url, {
			method: options.method ?? "GET",
			body: options.body,
			query: options.query,
			signal: options.signal,
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		if (!response.success) {
			throw new Error(response.error || "api error");
		}
		return response.data;
	}

	const isLoggedIn = computed<boolean>(() => !!user.value);

	const seasonsQuery = useQuery<VexSeasonModel[]>({
		queryKey: [QUERY_KEYS.seasons],
		queryFn: ({ signal }) =>
			vexFetch<VexSeasonModel[]>("/api/Vex/Seasons", { signal }),
		enabled: isLoggedIn,
		staleTime: 1000 * 60,
	});

	const sprintsQuery = useQuery<VexSprintModel[]>({
		queryKey: [QUERY_KEYS.sprints],
		queryFn: ({ signal }) =>
			vexFetch<VexSprintModel[]>("/api/Vex/Sprints", { signal }),
		enabled: isLoggedIn,
		staleTime: 1000 * 60,
	});

	const resourcesQuery = useQuery<VexResourceModel[]>({
		queryKey: [QUERY_KEYS.resources],
		queryFn: ({ signal }) =>
			vexFetch<VexResourceModel[]>("/api/Vex/Resources", { signal }),
		enabled: isLoggedIn,
		staleTime: 1000 * 60 * 5,
	});

	const Seasons: ComputedRef<VexSeasonModel[]> = computed(
		() => seasonsQuery.data.value ?? [],
	);
	const Sprints: ComputedRef<VexSprintModel[]> = computed(
		() => sprintsQuery.data.value ?? [],
	);
	const Resources: ComputedRef<VexResourceModel[]> = computed(
		() => resourcesQuery.data.value ?? [],
	);
	const isLoading: ComputedRef<boolean> = computed(
		() => seasonsQuery.isLoading.value || sprintsQuery.isLoading.value,
	);
	const loadError: ComputedRef<string | null> = computed(() => {
		const err: unknown = seasonsQuery.error.value || sprintsQuery.error.value;
		return err ? ErrorToString(err) : null;
	});

	/**
	 * Member id and mentor flag for the logged-in user (display only; server re-checks)
	 */
	const CurrentMemberId = computed<string | null>(() => {
		const meta = (user.value?.user_metadata ??
			null) as SupabaseUserMetaType | null;
		return (meta?.memberId as string | undefined) ?? null;
	});
	const IsMentor = computed<boolean>(() => {
		const meta = (user.value?.user_metadata ??
			null) as SupabaseUserMetaType | null;
		return meta?.isMentor === true;
	});

	const CurrentSeason = computed<VexSeasonModel | null>(() =>
		VexFindCurrentSeason(Seasons.value),
	);
	const PreviousSeasons = computed<VexSeasonModel[]>(() =>
		Seasons.value.filter((s) => s.id !== CurrentSeason.value?.id),
	);
	const SeasonsById = computed<Record<string, VexSeasonModel>>(() => {
		const byId: Record<string, VexSeasonModel> = {};
		for (const season of Seasons.value) {
			byId[season.id] = season;
		}
		return byId;
	});
	const SprintsById = computed<Record<string, VexSprintModel>>(() => {
		const byId: Record<string, VexSprintModel> = {};
		for (const sprint of Sprints.value) {
			byId[sprint.id] = sprint;
		}
		return byId;
	});
	const CurrentSprint = computed<VexSprintModel | null>(() =>
		VexFindCurrentSprint(Sprints.value, CurrentSeason.value?.id),
	);

	/**
	 * Sprints for a season, ordered by number
	 */
	function sprintsForSeason(seasonId: string | null | undefined) {
		return VexSeasonSprints(Sprints.value, seasonId);
	}

	/**
	 * Find a season by its URL slug
	 */
	function seasonBySlug(slug: string): VexSeasonModel | null {
		return Seasons.value.find((s) => s.slug === slug) ?? null;
	}

	/**
	 * Reactive query for tasks in one sprint
	 */
	function useSprintTasks(sprintId: Ref<string | null | undefined>) {
		const query = useQuery<VexTaskModel[]>({
			queryKey: [QUERY_KEYS.tasks, "sprint", sprintId],
			queryFn: ({ signal }) =>
				vexFetch<VexTaskModel[]>("/api/Vex/Tasks", {
					signal,
					query: { sprintId: sprintId.value ?? "" },
				}),
			enabled: computed<boolean>(() => isLoggedIn.value && !!sprintId.value),
			staleTime: 1000 * 30,
		});
		return {
			Tasks: computed<VexTaskModel[]>(() => query.data.value ?? []),
			isLoading: query.isLoading,
		};
	}

	/**
	 * Reactive query for all tasks in a season (for history progress)
	 */
	function useSeasonTasks(seasonId: Ref<string | null | undefined>) {
		const query = useQuery<VexTaskModel[]>({
			queryKey: [QUERY_KEYS.tasks, "season", seasonId],
			queryFn: ({ signal }) =>
				vexFetch<VexTaskModel[]>("/api/Vex/Tasks", {
					signal,
					query: { seasonId: seasonId.value ?? "" },
				}),
			enabled: computed<boolean>(() => isLoggedIn.value && !!seasonId.value),
			staleTime: 1000 * 30,
		});
		return {
			Tasks: computed<VexTaskModel[]>(() => query.data.value ?? []),
			isLoading: query.isLoading,
		};
	}

	/**
	 * Invalidate cached queries by key
	 */
	function invalidate(keys: string[]): void {
		for (const key of keys) {
			queryClient.invalidateQueries({ queryKey: [key] });
		}
	}

	/**
	 * Create or update a season (mentor)
	 */
	async function saveSeason(season: VexSeasonSaveModel) {
		const saved = await vexFetch<VexSeasonModel>("/api/Vex/SeasonSave", {
			method: "POST",
			body: season,
		});
		invalidate([QUERY_KEYS.seasons]);
		return saved;
	}

	/**
	 * Create or update a sprint / weekly objective (mentor)
	 */
	async function saveSprint(sprint: VexSprintSaveModel) {
		const saved = await vexFetch<VexSprintModel>("/api/Vex/SprintSave", {
			method: "POST",
			body: sprint,
		});
		invalidate([QUERY_KEYS.sprints]);
		return saved;
	}

	/**
	 * Create or update a task (any member)
	 */
	async function saveTask(task: VexTaskSaveModel) {
		const saved = await vexFetch<VexTaskModel>("/api/Vex/TaskSave", {
			method: "POST",
			body: task,
		});
		invalidate([QUERY_KEYS.tasks]);
		return saved;
	}

	/**
	 * Remove a task (creator or mentor)
	 */
	async function deleteTask(taskId: string) {
		await vexFetch<{ id: string }>("/api/Vex/TaskDelete", {
			method: "POST",
			body: { id: taskId },
		});
		invalidate([QUERY_KEYS.tasks]);
	}

	/**
	 * Create or update a resource link (mentor)
	 */
	async function saveResource(resource: VexResourceSaveModel) {
		const saved = await vexFetch<VexResourceModel>("/api/Vex/ResourceSave", {
			method: "POST",
			body: resource,
		});
		invalidate([QUERY_KEYS.resources]);
		return saved;
	}

	/**
	 * Remove a resource link (mentor)
	 */
	async function deleteResource(resourceId: string) {
		await vexFetch<{ id: string }>("/api/Vex/ResourceDelete", {
			method: "POST",
			body: { id: resourceId },
		});
		invalidate([QUERY_KEYS.resources]);
	}

	// Realtime: refresh when anyone else changes VEX data
	if (!isRealtimeWired) {
		isRealtimeWired = true;
		const realtime = UseSupabaseRealtimeAllTables();
		const onChange = (evt: { table: string }): void => {
			const keys: string[] | undefined = TABLE_QUERY_KEYS[evt.table];
			if (keys) {
				invalidate(keys);
			}
		};
		realtime.events.on("INSERT", onChange);
		realtime.events.on("UPDATE", onChange);
		realtime.events.on("DELETE", onChange);
	}

	return {
		CurrentMemberId,
		CurrentSeason,
		CurrentSprint,
		IsMentor,
		PreviousSeasons,
		Resources,
		Seasons,
		SeasonsById,
		Sprints,
		SprintsById,
		deleteResource,
		deleteTask,
		isLoading,
		isResourcesLoading: resourcesQuery.isLoading,
		loadError,
		saveResource,
		saveSeason,
		saveSprint,
		saveTask,
		seasonBySlug,
		sprintsForSeason,
		useSeasonTasks,
		useSprintTasks,
	};
}
