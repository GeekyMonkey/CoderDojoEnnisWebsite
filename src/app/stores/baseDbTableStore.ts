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
import { useLogger } from "~~/shared/utils/Logger";

export default function baseDbTableStore<T extends BaseModel>({
  apiPath,
  tableName,
  getLabel,
  onInsert,
  onUpdate,
  onDelete,
}: {
  apiPath: string;
  tableName: string;
  getLabel: (item: T) => string | null;
  onInsert?: (evt: { table: string; id: string; newData: T }) => void;
  onUpdate?: (evt: {
    table: string;
    id: string;
    newData: T;
    oldData: T;
  }) => void;
  onDelete?: (evt: { table: string; id: string; oldData: T }) => void;
}) {
  const log = useLogger(`${tableName}Store`);
  log.info(`Initializing ${tableName}Store`);

  const queryClient = useQueryClient();

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
        { signal },
      );
      if (!response.success) {
        throw new Error(response.error || "api error");
      }

      return response.data;
    },
  });

  // Subscribe to realtime changes via global all-tables channel (single WS)
  const { events: allEvents } = UseSupabaseRealtimeAllTables();
  allEvents.on("INSERT", (evt) => {
    if (evt.table !== tableName) {
      return;
    }
    if (onInsert) {
      onInsert(evt as { table: string; id: string; newData: T });
    } else {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    }
  });
  allEvents.on("UPDATE", (evt) => {
    if (evt.table !== tableName) {
      return;
    }
    if (onUpdate) {
      onUpdate(evt as { table: string; id: string; newData: T; oldData: T });
    } else {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    }
  });
  allEvents.on("DELETE", (evt) => {
    if (evt.table !== tableName) {
      return;
    }
    if (onDelete) {
      onDelete(evt as { table: string; id: string; oldData: T });
    } else {
      queryClient.setQueryData<T[]>([tableName], (items) =>
        items?.filter((item) => item.id !== evt.id),
      );
    }
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
