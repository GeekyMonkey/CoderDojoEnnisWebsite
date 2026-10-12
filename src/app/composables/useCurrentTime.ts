import { onMounted, onScopeDispose, ref, type Ref } from "vue";
/** Update a scoped clock for time-dependent displays without reloading the page. */
export function useCurrentTime(interval: number = 30_000): Ref<number> {
 const now: Ref<number> = ref(Date.now());
 let timer: ReturnType<typeof setInterval> | null = null;
 onMounted((): void => { now.value = Date.now(); timer = setInterval((): void => { now.value = Date.now(); }, interval); });
 onScopeDispose((): void => { if (timer !== null) clearInterval(timer); });
 return now;
}
