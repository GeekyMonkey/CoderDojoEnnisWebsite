import { useMutation } from "@tanstack/vue-query";
import type { Ref } from "vue";
import { profilePasswordSchema, type ProfilePasswordChange } from "#shared/types/MemberProfile";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { useProfileStore, type ProfileStore } from "./useProfileStore";

type MyProfileStore = ProfileStore & {
	isChangingPassword: Ref<boolean>;
	changePassword: (change: ProfilePasswordChange) => Promise<null>;
};

/** Own the logged-in member's profile and password actions regardless of role. */
export function useMyProfileStore(): MyProfileStore {
	const store: ProfileStore = useProfileStore(null);
	const headers: ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
	const mutation: ReturnType<typeof useMutation<null, Error, ProfilePasswordChange>> = useMutation<null, Error, ProfilePasswordChange>({
		mutationFn: async (change: ProfilePasswordChange): Promise<null> => {
			await $fetch("/api/Profile/password", { method: "POST", headers: await headers(), body: profilePasswordSchema.parse(change) });
			return null;
		},
	});
	return { ...store, isChangingPassword: mutation.isPending, changePassword: mutation.mutateAsync };
}
