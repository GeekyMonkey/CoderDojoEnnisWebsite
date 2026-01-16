import type { SessionModel } from "~~/shared/types/models/SessionModel";
import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Session data
 */
export function useSessionStore() {
	const store = baseDbTableStore<SessionModel>({
		apiPath: "sessions",
		tableName: "sessions",
		getLabel: (item: SessionModel) => item.sessionDate,
	});

	const SessionsById = computed<Record<string, SessionModel>>(() => {
		const byId: Record<string, SessionModel> = {};
		store.Items.value?.forEach((item) => {
			byId[item.id] = item;
		});
		return byId;
	});

	return {
		...store,
		Sessions: store.Items,
		SessionsById,
	};
}
