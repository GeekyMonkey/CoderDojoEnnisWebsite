import { computed, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue";

type ProfileImageRevision = { revision: ComputedRef<string>; refresh: () => void };

/** Share hydrated image revisions across profiles and member lists. */
export function useProfileImageRevision(memberId: MaybeRefOrGetter<string>): ProfileImageRevision {
    const epoch: Ref<string> = useState<string>("profile-image-epoch", (): string => String(Date.now()));
    const revisions: Ref<Record<string, number>> = useState<Record<string, number>>("profile-image-revisions", (): Record<string, number> => ({}));
    const revision: ComputedRef<string> = computed((): string => `${epoch.value}-${revisions.value[toValue(memberId)] ?? 0}`);
    /** Invalidate the current member's browser image URLs after a save or realtime refresh. */
    function refresh(): void {
        const id: string = toValue(memberId);
        if (id) revisions.value[id] = (revisions.value[id] ?? 0) + 1;
    }
    return { revision, refresh };
}
