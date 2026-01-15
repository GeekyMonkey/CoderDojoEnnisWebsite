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

	return {
		...store,
		MemberBelts: store.Items,
	};
}

