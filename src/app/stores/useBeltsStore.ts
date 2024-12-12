import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Belts data
 */
export function useBeltsStore() {
	const beltsStore = baseDbTableStore<BeltModel>({
		tableName: "belts",
		getLabel: (belt: BeltModel) => belt.color,
	});

	return {
		...beltsStore,
		Belts: beltsStore.Items,
	};
}
