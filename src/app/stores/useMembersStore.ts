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

	return {
		...membersStore,
		Members: membersStore.Items,
	};
}
