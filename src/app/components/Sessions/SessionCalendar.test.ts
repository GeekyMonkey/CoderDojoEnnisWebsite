import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, ref, type SetupContext, type VNode } from "vue";
import { renderToString } from "vue/server-renderer";
import SessionCalendar from "./SessionCalendar.vue";

const mocks = vi.hoisted(() => ({ member: vi.fn(), publicReader: vi.fn(), reader: null as unknown }));
vi.mock("~/stores/useMemberCalendarStore", (): object => ({ useMemberCalendarStore: mocks.member }));
vi.mock("~/stores/public/usePublicCalendarStore", (): object => ({ usePublicCalendarStore: mocks.publicReader }));
afterEach((): void => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("shared calendar public presentation", (): void => {
  it("renders the new session component without member stores, pods or management controls", async (): Promise<void> => {
    vi.stubGlobal("useI18n", (): object => ({ t: (key: string): string => key, locale: ref("en") }));
    mocks.reader = { data: ref({
      today: "2026-10-14", pods: [], isMentor: false, sessions: [
        { id: "00000000-0000-4000-8000-000000000001", sessionDate: "2030-10-14", topic: "Coding Session", description: "Bring a laptop", sessionType: "CODING" },
        { id: "00000000-0000-4000-8000-000000000002", sessionDate: "2030-10-15", topic: "Private planning", description: "Private", sessionType: "MENTOR_PLANNING" },
      ],
    }), isPending: ref(false), isError: ref(false), isFetching: ref(false), refetch: vi.fn() };
    mocks.publicReader.mockReturnValue(mocks.reader);
    const markup: string = await renderToString(createSSRApp(SessionCalendar));
    expect(markup).toContain("Coding Session");
    expect(markup).toContain("Bring a laptop");
    expect(markup).toContain("public-calendar");
    expect(markup).not.toContain("Private planning");
    expect(markup).not.toContain("/mentor/");
    expect(mocks.member).not.toHaveBeenCalled();
  });
  it("retains the member branch and its mentor management controls", async (): Promise<void> => {
    vi.stubGlobal("useI18n", (): object => ({ t: (key: string): string => key, locale: ref("en") }));
    mocks.member.mockReturnValue({ data: ref({
      today: "2026-10-14", pods: [], isMentor: true, sessions: [
        { id: "00000000-0000-4000-8000-000000000003", sessionDate: "2030-10-14", topic: "Private planning", description: "Mentors", sessionType: "MENTOR_PLANNING" },
      ],
    }), isPending: ref(false), isError: ref(false), isMentor: ref(true), isSaving: ref(false), join: vi.fn() });
    const app: ReturnType<typeof createSSRApp> = createSSRApp(SessionCalendar, { memberMode: true, showManagement: true });
    app.component("UTabs", { setup: (_props: unknown, { slots }: SetupContext): (() => VNode) => (): VNode => h("section", slots.content?.()) });
    app.component("UButton", { setup: (_props: unknown, { slots, attrs }: SetupContext): (() => VNode) => (): VNode => h("a", { href: attrs.to }, slots.default?.()) });
    app.component("UBadge", { setup: (_props: unknown, { slots }: SetupContext): (() => VNode) => (): VNode => h("span", slots.default?.()) });
    app.component("UIcon", { render: (): VNode => h("span") });
    const markup: string = await renderToString(app);
    expect(markup).toContain("Private planning");
    expect(markup).toContain("/mentor/calendar/new");
    expect(markup).not.toContain("public-calendar");
    expect(mocks.member).toHaveBeenCalled();
    expect(mocks.publicReader).not.toHaveBeenCalled();
  });

});
