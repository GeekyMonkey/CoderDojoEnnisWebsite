import baseDbTableStore from "./baseDbTableStore";
import type { MemberBeltModel } from "~~/shared/types/models/MemberBeltModel";

/**
 * Client-side store for member_belts with realtime invalidation.
 */
export function useMemberBeltsStore() {
	const store = baseDbTableStore<MemberBeltModel>({
		apiPath: "memberBelts",
		tableName: "member_belts",
		getLabel: (item) => `${item.memberId}-${item.beltId}`,
	});

	/**
	 * Map of memberId to their latest awarded MemberBeltModel
	 */
	const MembersLatestBeltsByMemberId = computed(() => {
		const map: Record<string, MemberBeltModel> = {};
		const items = store.Items.value;
		if (!items) {
			return map;
		}
		for (const memberBelt of items) {
			if (
				!map[memberBelt.memberId] ||
				(map[memberBelt.memberId]?.awarded ?? 0) < (memberBelt.awarded ?? 0)
			) {
				map[memberBelt.memberId] = memberBelt;
			}
		}
		return map;
	});

	return {
		...store,
		MemberBelts: store.Items,
		MembersLatestBeltsByMemberId,
	};
}
