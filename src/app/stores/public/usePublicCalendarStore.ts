import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery, type QueryFunctionContext, type UseQueryReturnType } from "@tanstack/vue-query";
import { memberCalendarSchema, type CalendarEntry, type CalendarView, type MemberCalendar } from "#shared/types/MemberCalendar";

// Keep the anonymous feed free of planning sessions, pods and management capabilities.
export function parsePublicCalendar(value: unknown): MemberCalendar {
  const calendar: MemberCalendar = memberCalendarSchema.parse(value);
  return {
    ...calendar,
    sessions: calendar.sessions.filter((entry: CalendarEntry): boolean => entry.sessionType !== "MENTOR_PLANNING"),
    pods: [],
    isMentor: false,
  };
}

// Read the existing public calendar with independent cache keys and no member-store initialization.
export function usePublicCalendarStore(view: MaybeRefOrGetter<CalendarView> = "future"): UseQueryReturnType<MemberCalendar, Error> {
  return useQuery<MemberCalendar, Error>({
    queryKey: computed((): readonly unknown[] => ["public", "calendar", toValue(view)]),
    queryFn: async ({ signal }: QueryFunctionContext): Promise<MemberCalendar> => {
      const payload: unknown = await $fetch<unknown>("/api/calendar", { query: { view: toValue(view) }, signal, retry: 0 });
      return parsePublicCalendar(payload);
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}
