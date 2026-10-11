import { useProfileImageRevision } from "~/composables/useProfileImageRevision";
import type { ProfileImageAction } from "#shared/types/ProfileImages";
import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/vue-query";
import { computed, onScopeDispose, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";
import { MemberModelSchema, type MemberModel } from "#shared/types/models/MemberModel";
import { memberProfileResponseSchema, memberProfileUpdateSchema, profileIdentitySchema, type MemberProfileResponse, type MemberProfileUpdate } from "#shared/types/MemberProfile";
import { UseSupabaseRealtimeAllTables } from "~/composables/UseSupabaseRealtimeAllTables";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";

export type ProfileStore = {
	profile: Ref<MemberModel | null>;
	permissions: Ref<MemberProfileResponse["permissions"] | null>;
	isPending: Ref<boolean>; isError: Ref<boolean>; isSaving: Ref<boolean>;
	save: (update: MemberProfileUpdate) => Promise<MemberModel>;
	reload: () => Promise<void>;
	isSavingImages: Ref<boolean>;
	changeImages: (action: ProfileImageAction) => Promise<MemberModel>;
};

/** Share validated profile queries, mutations and realtime refresh between own and selected profiles. */
export function useProfileStore(memberId: MaybeRefOrGetter<string> | null): ProfileStore {
	const user: ReturnType<typeof useSupabaseUser> = useSupabaseUser();
	const queryClient: ReturnType<typeof useQueryClient> = useQueryClient();
	const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
	const id: ComputedRef<string | null> = computed((): string | null => memberId === null ? null : toValue(memberId));
	const path: ComputedRef<string> = computed((): string => id.value === null ? "/api/Profile" : `/api/Profiles/${profileIdentitySchema.parse(id.value)}`);
	const key: ComputedRef<readonly unknown[]> = computed((): readonly unknown[] => ["profiles", user.value?.email ?? "", id.value === null ? "my" : id.value]);
	const query: ReturnType<typeof useQuery<MemberProfileResponse | null>> = useQuery<MemberProfileResponse | null>({
		queryKey: key,
		enabled: computed((): boolean => Boolean(user.value) && (id.value === null || profileIdentitySchema.safeParse(id.value).success)),
		queryFn: async ({ signal }: QueryFunctionContext): Promise<MemberProfileResponse> =>
			memberProfileResponseSchema.parse(await $fetch<unknown>(path.value, { headers: await headers(), signal })),
		staleTime: 30_000, retry: false,
	});

	const { refresh: refreshImages } = useProfileImageRevision((): string => query.data.value?.member.id ?? "");

	/** Invalidate own, selected and listing caches consistently for every profile change. */
	async function reload(): Promise<void> {
		refreshImages();
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["profiles"] }),
			queryClient.invalidateQueries({ queryKey: ["members"] }),
		]);
	}

	const mutation: ReturnType<typeof useMutation<MemberModel, Error, MemberProfileUpdate>> = useMutation<MemberModel, Error, MemberProfileUpdate>({
		mutationFn: async (update: MemberProfileUpdate): Promise<MemberModel> =>
			MemberModelSchema.parse(await $fetch(path.value, { method: "PATCH", headers: await headers(), body: memberProfileUpdateSchema.parse(update) })),
		onSettled: reload,
	});
	const imageMutation: ReturnType<typeof useMutation<MemberModel, Error, ProfileImageAction>> = useMutation<MemberModel, Error, ProfileImageAction>({
        mutationFn: async (action: ProfileImageAction): Promise<MemberModel> => MemberModelSchema.parse(await $fetch(`${path.value}/images`, { method: "POST", headers: await headers(), body: action })),
        onSettled: reload,
    });
    const realtime: ReturnType<typeof UseSupabaseRealtimeAllTables> = UseSupabaseRealtimeAllTables();

	/** Refresh active profile views when member rows change in any session. */
	function invalidate(event: { table: string }): void {
		if (event.table === "members") void reload();
	}
	realtime.events.on("INSERT", invalidate);
	realtime.events.on("UPDATE", invalidate);
	realtime.events.on("DELETE", invalidate);
	onScopeDispose((): void => {
		realtime.events.off("INSERT", invalidate);
		realtime.events.off("UPDATE", invalidate);
		realtime.events.off("DELETE", invalidate);
	});
	return {
		profile: computed((): MemberModel | null => query.data.value?.member ?? null),
		permissions: computed((): MemberProfileResponse["permissions"] | null => query.data.value?.permissions ?? null),
		isPending: query.isPending, isError: query.isError, isSaving: mutation.isPending,
		save: mutation.mutateAsync, reload, isSavingImages: imageMutation.isPending, changeImages: imageMutation.mutateAsync,
	};
}
