import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Belts data
 */
export function useBeltsStore() {
	const beltsStore = baseDbTableStore<BeltModel>({
		apiPath: "belts",
		tableName: "belts",
		getLabel: (belt: BeltModel) => belt.color,
	});

	const BeltsById = computed<Record<string, BeltModel>>(() => {
		const byId: Record<string, BeltModel> = {};
		beltsStore.Items.value?.forEach((belt) => {
			byId[belt.id] = belt;
		});
		return byId;
	});

	return {
		...beltsStore,
		Belts: beltsStore.Items,
		BeltsById,
	};
}
