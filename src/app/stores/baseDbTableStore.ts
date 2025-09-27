import { useQueryClient, useQuery } from "@tanstack/vue-query";

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
export default function baseDbTableStore<T extends BaseModel>({
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
		queryFn: async ({ signal }) => {
			console.log(`[${tableName}Store] Fetching ${tableName}`);
			const includeDeleted: boolean = false;
			const response = await $fetch<ApiResponse<T[]>>(
				`/api/${tableName}/list?include_deleted=${includeDeleted}`,
				{ signal },
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
			.filter((item: T) => !item.deleted)
			.map((item: T) => ({
				value: item.id,
				label: getLabel(item) ?? "",
			}));
	});

	return {
		Items: Items as Ref<T[]>,
		Options,
		isLoading,
		isError,
		error,
	};
}
