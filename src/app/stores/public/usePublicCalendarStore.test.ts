import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref, type EffectScope, type Ref } from "vue";
import { QueryClient } from "@tanstack/vue-query";
import { parsePublicCalendar, usePublicCalendarStore } from "./usePublicCalendarStore";
import type { CalendarEntry, CalendarView, MemberCalendar } from "#shared/types/MemberCalendar";

const mocks = vi.hoisted(() => ({ client: null as QueryClient | null, fetch: vi.fn() }));
vi.mock("@tanstack/vue-query", async (original): Promise<unknown> => {
  const actual: typeof import("@tanstack/vue-query") = await original<typeof import("@tanstack/vue-query")>();
  return { ...actual, useQuery: (options: Parameters<typeof actual.useQuery>[0]): unknown => actual.useQuery(options, mocks.client!) };
});
const ENTRY: CalendarEntry = { id: "00000000-0000-4000-8000-000000000001", sessionDate: "2030-10-14", topic: "Coding Session", description: "Bring a laptop", sessionType: "CODING" };
const DATA: MemberCalendar = { sessions: [ENTRY], pods: [], isMentor: false, today: "2026-10-14" };
let scope: EffectScope;
beforeEach((): void => {
  mocks.client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  mocks.fetch.mockReset().mockResolvedValue(DATA);
  scope = effectScope();
  vi.stubGlobal("$fetch", mocks.fetch);
});
afterEach((): void => { scope.stop(); mocks.client!.clear(); vi.unstubAllGlobals(); });

describe("anonymous public calendar store", (): void => {
  it("shares public queries, passes cancellation and changes date views without authorization", async (): Promise<void> => {
    const view: Ref<CalendarView> = ref<CalendarView>("future");
    const store: ReturnType<typeof usePublicCalendarStore> = scope.run(() => usePublicCalendarStore(view))!;
    scope.run(() => usePublicCalendarStore(view));
    await vi.waitFor(() => expect(store.data.value).toEqual(DATA));
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.fetch).toHaveBeenCalledWith("/api/calendar", { query: { view: "future" }, signal: expect.any(AbortSignal), retry: 0 });
    expect(mocks.client!.getQueryData(["public", "calendar", "future"])).toEqual(DATA);
    view.value = "past";
    await vi.waitFor(() => expect(mocks.fetch).toHaveBeenLastCalledWith("/api/calendar", { query: { view: "past" }, signal: expect.any(AbortSignal), retry: 0 }));
  });

  it("never exposes planning sessions or management privileges even with a malformed public scope", (): void => {
    expect(parsePublicCalendar({ ...DATA, isMentor: true, sessions: [ENTRY, { ...ENTRY, sessionType: "MENTOR_PLANNING" }] })).toEqual(DATA);
    expect((): MemberCalendar => parsePublicCalendar({ sessions: [] })).toThrow();
  });

  it("retains cached sessions on errors and recovers through refetch", async (): Promise<void> => {
    const store: ReturnType<typeof usePublicCalendarStore> = scope.run(() => usePublicCalendarStore())!;
    await vi.waitFor(() => expect(store.data.value).toEqual(DATA));
    mocks.fetch.mockRejectedValueOnce(new Error("unavailable"));
    await store.refetch();
    expect(store.isError.value).toBe(true);
    expect(store.data.value).toEqual(DATA);
    mocks.fetch.mockResolvedValue({ ...DATA, sessions: [] });
    await store.refetch();
    expect(store.isError.value).toBe(false);
    expect(store.data.value?.sessions).toEqual([]);
  });
});
