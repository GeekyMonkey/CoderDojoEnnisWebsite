import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import type { ApiResponse, SelectOption } from "~~/shared/types";
import { UseSupabaseRealtimeTable } from "../composables/UseSupabaseRealtimeTable";

/**
 * Common to all db models
 */
export type BaseModel = {
	id: string;
	deleted: boolean;
};

/**
 * Create a DB store client with auto-updating data
 */
export function CreateDbTableStore<T extends BaseModel>({
	tableName,
	getLabel,
}: {
	tableName: string;
	getLabel: (item: T) => string | null;
}) {
	console.log(`[${tableName}Store] Initializing`);

	const queryClient = useQueryClient();

	const {
		data: Items,
		isLoading,
		isError,
		error,
	} = useQuery<T[]>({
		queryKey: [tableName],
		queryFn: async () => {
			console.log(`[${tableName}Store] Fetching ${tableName}`);
			const includeDeleted: boolean = false;
			const response = await $fetch<ApiResponse<T[]>>(
				`/api/tables/${tableName}/list?include_deleted=${includeDeleted}`,
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}

			return response.data;
		},
	});

	const { events } = UseSupabaseRealtimeTable({ table: tableName });
	events?.on("INSERT", () => {
		queryClient.invalidateQueries({ queryKey: [tableName] });
	});
	events?.on("UPDATE", () => {
		queryClient.invalidateQueries({ queryKey: [tableName] });
	});
	events?.on("DELETE", (data) => {
		queryClient.setQueryData<T[]>([tableName], (items) =>
			items?.filter((item) => item.id !== data.id),
		);
	});

	const Options = computed<SelectOption[]>(() => {
		return (Items.value || [])
			.filter((item) => !item.deleted && getLabel(item) !== null)
			.map((item) => ({
				value: item.id,
				label: getLabel(item) ?? "",
			}));
	});

	return {
		Items,
		Options,
		isLoading,
		isError,
		error,
	};
}
