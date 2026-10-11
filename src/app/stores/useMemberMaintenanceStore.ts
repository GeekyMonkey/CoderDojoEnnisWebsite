import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, type ComputedRef, type Ref } from "vue";
import { maintenanceDataSchema, newMemberSchema, accountUpdateSchema, goalUpdateSchema, relationshipInputSchema, skillInputSchema, passwordResetSchema,
	type MaintenanceData, type NewMember, type AccountFields, type GoalFields, type GuardedUpdate, type RelationshipInput, type SkillInput, type PasswordReset } from "#shared/types/MemberMaintenance";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import { MemberModelSchema, type MemberModel } from "#shared/types/models/MemberModel";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";

export type MemberMaintenanceStore = {
	data: Ref<MaintenanceData | undefined>; isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>;
	membersById: ComputedRef<Record<string, MemberModel>>;
	create: (body: NewMember) => Promise<MemberModel>;
	saveAccount: (id: string, body: GuardedUpdate<AccountFields>) => Promise<MemberModel>;
	saveGoals: (id: string, body: GuardedUpdate<GoalFields>) => Promise<MemberModel>;
	resetPassword: (id: string, body: PasswordReset) => Promise<null>;
	link: (body: RelationshipInput) => Promise<null>; unlink: (body: RelationshipInput) => Promise<null>;
	addSkill: (body: SkillInput) => Promise<null>; removeSkill: (body: SkillInput) => Promise<null>;
	reload: () => Promise<void>;
};
type MaintenanceWrite = { path: string; method: "POST" | "PATCH" | "DELETE"; body: Record<string, unknown>; memberResponse: boolean };

/** Own mentor maintenance requests, query caching and cross-session realtime refresh. */
export function useMemberMaintenanceStore(): MemberMaintenanceStore {
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const query: ReturnType<typeof useQuery<MaintenanceData>> = useQuery<MaintenanceData>({
		queryKey: computed((): readonly unknown[] => ["memberMaintenance", user.value?.email ?? ""]),
		enabled: computed((): boolean => Boolean(user.value)),
		queryFn: async ({ signal }: QueryFunctionContext): Promise<MaintenanceData> => maintenanceDataSchema.parse(await $fetch("/api/Management", { headers: await headers(), signal })),
		staleTime: 30_000, retry: false,
	});
	const membersById: ComputedRef<Record<string, MemberModel>> = computed((): Record<string, MemberModel> => Object.fromEntries((query.data.value?.members ?? []).map((member: MemberModel): [string, MemberModel] => [member.id, member])));

	/** Refresh all derived directories, profiles and progress after successful or conflicting writes. */
	async function reload(): Promise<void> {
		await Promise.all(["memberMaintenance", "profiles", "members", "memberAttendanceHistory"].map((key: string): Promise<void> => queryClient.invalidateQueries({ queryKey: [key] })));
	}
	const mutation: ReturnType<typeof useMutation<MemberModel | null, Error, MaintenanceWrite>> = useMutation<MemberModel | null, Error, MaintenanceWrite>({
		mutationFn: async (write: MaintenanceWrite): Promise<MemberModel | null> => {
			const response: unknown = await $fetch(write.path, { method: write.method, headers: await headers(), body: write.body });
			return write.memberResponse ? MemberModelSchema.parse(response) : null;
		}, onSettled: reload,
	});

	/** Submit a validated operation and normalize an unavailable result to null. */
	async function write(path: string, method: MaintenanceWrite["method"], body: Record<string, unknown>, memberResponse: boolean = false): Promise<MemberModel | null> {
		return mutation.mutateAsync({ path: `/api/Management${path}`, method, body, memberResponse });
	}
	/** Register a new member with role-specific defaults. */
	async function create(body: NewMember): Promise<MemberModel> { return MemberModelSchema.parse(await write("", "POST", newMemberSchema.parse(body), true)); }
	/** Save the selected member's account section. */
	async function saveAccount(id: string, body: GuardedUpdate<AccountFields>): Promise<MemberModel> { return MemberModelSchema.parse(await write(`/${profileIdentitySchema.parse(id)}/account`, "PATCH", accountUpdateSchema.parse(body), true)); }
	/** Save the selected coder's goals. */
	async function saveGoals(id: string, body: GuardedUpdate<GoalFields>): Promise<MemberModel> { return MemberModelSchema.parse(await write(`/${profileIdentitySchema.parse(id)}/goals`, "PATCH", goalUpdateSchema.parse(body), true)); }
	/** Reset credentials through the independent password action. */
	async function resetPassword(id: string, body: PasswordReset): Promise<null> { await write(`/${profileIdentitySchema.parse(id)}/password`, "POST", passwordResetSchema.parse(body)); return null; }
	/** Link a parent and coder. */
	async function link(body: RelationshipInput): Promise<null> { await write("/relationships", "POST", relationshipInputSchema.parse(body)); return null; }
	/** Remove a parent-child link. */
	async function unlink(body: RelationshipInput): Promise<null> { await write("/relationships", "DELETE", relationshipInputSchema.parse(body)); return null; }
	/** Assign a mentor skill. */
	async function addSkill(body: SkillInput): Promise<null> { await write("/skills", "POST", skillInputSchema.parse(body)); return null; }
	/** Remove a mentor skill. */
	async function removeSkill(body: SkillInput): Promise<null> { await write("/skills", "DELETE", skillInputSchema.parse(body)); return null; }

	const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();
	/** Invalidate relevant caches for every remote maintenance change. */
	function invalidate(event: { table: string }): void {
		if (["members", "member_parents", "member_badge_categories", "member_attendances", "teams", "badge_categories"].includes(event.table)) void reload();
	}
	realtime.events.on("INSERT", invalidate); realtime.events.on("UPDATE", invalidate); realtime.events.on("DELETE", invalidate);
	onScopeDispose((): void => { realtime.events.off("INSERT", invalidate); realtime.events.off("UPDATE", invalidate); realtime.events.off("DELETE", invalidate); });
	return { data: query.data, isPending: query.isPending, isError: query.isError, isSaving: mutation.isPending, membersById, create, saveAccount, saveGoals, resetPassword, link, unlink, addSkill, removeSkill, reload };
}
