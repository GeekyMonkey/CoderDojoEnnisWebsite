import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, effectScope, nextTick, reactive, ref, watch, type EffectScope } from "vue";

const mocks = vi.hoisted(() => ({ data: null as unknown }));
vi.mock("@tanstack/vue-query", (): object => ({ useQuery: (): object => ({ data: mocks.data }) }));
afterEach((): void => { vi.unstubAllGlobals(); });

describe("application theme shell lifecycle", (): void => {
  it("keeps system theme synchronization after leaving and returning to application pages", async (): Promise<void> => {
    const setAttribute: ReturnType<typeof vi.fn> = vi.fn();
    const mode: { value: string; preference: string } = reactive({ value: "light", preference: "system" });
    vi.stubGlobal("ref", ref); vi.stubGlobal("computed", computed); vi.stubGlobal("watch", watch);
    vi.stubGlobal("useLogger", (): object => ({ info: vi.fn(), error: vi.fn() }));
    vi.stubGlobal("useColorMode", (): object => mode);
    vi.stubGlobal("document", { documentElement: { setAttribute } });
    vi.stubGlobal("localStorage", { getItem: (): null => null, removeItem: (): void => {}, setItem: (): void => {} });
    const config: ReturnType<typeof ref> = ref(null);
    mocks.data = config;
    const { useUiConfig } = await import("./useUiConfig");
    const firstShell: EffectScope = effectScope();
    firstShell.run((): void => { useUiConfig(); });
    config.value = { themesConfig: { themes: [
      { id: "light", darkOrLight: "light" }, { id: "dark", darkOrLight: "dark" },
    ] } };
    await nextTick();
    expect(setAttribute).toHaveBeenLastCalledWith("theme", "light");
    firstShell.stop();
    const nextShell: EffectScope = effectScope();
    nextShell.run((): void => { useUiConfig(); });
    mode.value = "dark";
    await nextTick();
    expect(setAttribute).toHaveBeenLastCalledWith("theme", "dark");
    nextShell.stop();
  });
});
