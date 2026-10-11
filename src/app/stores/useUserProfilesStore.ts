import type { MaybeRefOrGetter } from "vue";
import { useProfileStore, type ProfileStore } from "./useProfileStore";

/** Own a selected member's profile; viewing and editing permissions come from the server. */
export function useUserProfilesStore(memberId: MaybeRefOrGetter<string>): ProfileStore {
	return useProfileStore(memberId);
}
