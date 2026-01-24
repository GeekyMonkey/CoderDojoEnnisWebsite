import baseDbTableStore from "./baseDbTableStore";

/**
 * Auto-updating store of Members data
 */
export function useMembersStore() {
	const membersStore = baseDbTableStore<MemberModel>({
		apiPath: "members",
		tableName: "members",
		getLabel: (member: MemberModel) => {
			const first = member.nameFirst ?? "";
			const last = member.nameLast ?? "";
			const fullName = `${first} ${last}`.trim();
			return fullName || member.login || member.id;
		},
	});

	/**
	 * Map of Members by ID
	 */
	const MembersById = computed(() => {
		const map: Record<string, MemberModel> = {};
		if (membersStore.Items) {
			for (const member of membersStore.Items.value || []) {
				map[member.id] = member;
			}
		}
		return map;
	});

	return {
		...membersStore,
		Members: membersStore.Items,
		MembersById,
	};
}
