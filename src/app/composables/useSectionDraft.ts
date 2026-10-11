import { computed, reactive, ref, watch, type ComputedRef, type Ref } from "vue";

type SectionDraft<T extends object> = { fields: T; baseline: Ref<T>; dirty: ComputedRef<boolean>; remoteChanged: ComputedRef<boolean>; reset: () => void };

/** Preserve unsaved section edits while clean sections follow realtime changes. */
export function useSectionDraft<T extends object, S extends { id: string }>(member: () => S, snapshot: (value: S) => T): SectionDraft<T> {
	const fields: T = reactive({ ...snapshot(member()) }) as T;
	const baseline: Ref<T> = ref({ ...snapshot(member()) }) as Ref<T>;
	const identity: Ref<string> = ref(member().id);
	const dirty: ComputedRef<boolean> = computed((): boolean => JSON.stringify(fields) !== JSON.stringify(baseline.value));
	const remoteChanged: ComputedRef<boolean> = computed((): boolean => JSON.stringify(snapshot(member())) !== JSON.stringify(baseline.value));

	/** Discard section edits and use the latest server snapshot. */
	function reset(): void { baseline.value = { ...snapshot(member()) }; Object.assign(fields, baseline.value); identity.value = member().id; }
	watch((): T => snapshot(member()), (): void => { if (identity.value !== member().id || !dirty.value) reset(); }, { deep: true });
	return { fields, baseline, dirty, remoteChanged, reset };
}
