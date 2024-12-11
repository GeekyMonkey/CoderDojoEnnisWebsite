import { CreateDbTableStore } from "../utils/CreateDbTableStore";

/**
 * Auto-updating store of Belts data
 */
export function useBeltsStore() {
	const beltsStore = CreateDbTableStore<BeltModel>({
		tableName: "belts",
		getLabel: (belt: BeltModel) => belt.color,
	});

	return {
		...beltsStore,
		Belts: beltsStore.Items,
	};
}
