import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { UseSupabaseRealtimeAllTables } from "../composables/UseSupabaseRealtimeAllTables";

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
import { useLogger } from "#shared/utils/Logger";

export default function baseDbTableStore<T extends BaseModel>({
	apiPath,
	tableName,
	getLabel,
}: {
	apiPath: string;
	tableName: string;
	getLabel: (item: T) => string | null;
}) {
	const log = useLogger(`${tableName}Store`);
	log.info(`Initializing ${tableName}Store`);

	const queryClient = useQueryClient();
 const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();

	const {
		data: Items,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<T[]>({
		queryKey: [tableName],
		queryFn: async ({ signal }) => {
			const includeDeleted: boolean = false;
			log.info(`Fetching table ${tableName}`, { includeDeleted });
			const response = await $fetch<ApiResponse<T[]>>(
				`/api/${apiPath}/list?include_deleted=${includeDeleted}`,
				{ signal, headers: await headers() },
			);
			if (!response.success) {
				throw new Error(response.error || "api error");
			}

			return response.data;
		},
	});

 // Invalidate and refetch; no row or record-ID payload is available on the safe transport.
 const { events: allEvents } = UseSupabaseRealtimeAllTables();
 /** Refresh this table's authorized projection for any operation. */
 function invalidate(event: { table: string }): void {
  if (event.table === tableName) void queryClient.invalidateQueries({ queryKey: [tableName] });
 }
 for (const operation of ["INSERT", "UPDATE", "DELETE"] as const) allEvents.on(operation, invalidate);
 onScopeDispose((): void => {
  for (const operation of ["INSERT", "UPDATE", "DELETE"] as const) allEvents.off(operation, invalidate);
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
		refetch,
	};
}
