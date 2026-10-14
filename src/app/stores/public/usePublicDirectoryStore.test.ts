import { afterEach, describe, expect, it, vi } from "vitest";
import { createRenderer, h, type App } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { parsePublicDirectory, usePublicDirectoryStore, type PublicDirectory } from "./usePublicDirectoryStore";

type HostNode = Record<string, unknown>;
type Store = ReturnType<typeof usePublicDirectoryStore>;
type Harness = { stores: Store[]; client: QueryClient; app: App<HostNode> };
const DATA: PublicDirectory = { Members: [{ FirstName: "Coder", LastName: null, GithubLogin: "coder-one" }], Mentors: [] };
const harnesses: Harness[] = [];

// Mount store consumers against the real provider without requiring a browser DOM.
function mountStores(client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })): Harness {
  const stores: Store[] = [];
  const renderer: ReturnType<typeof createRenderer<HostNode, HostNode>> = createRenderer<HostNode, HostNode>({
    patchProp: (): void => {}, insert: (): void => {}, remove: (): void => {},
    createElement: (): HostNode => ({}), createText: (): HostNode => ({}), createComment: (): HostNode => ({}),
    setText: (): void => {}, setElementText: (): void => {}, parentNode: (): null => null, nextSibling: (): null => null,
  });
  const app: App<HostNode> = renderer.createApp({ setup: (): (() => ReturnType<typeof h>) => {
    stores.push(usePublicDirectoryStore(), usePublicDirectoryStore());
    return (): ReturnType<typeof h> => h("div");
  } });
  app.use(VueQueryPlugin, { queryClient: client });
  app.mount({});
  const harness: Harness = { stores, client, app };
  harnesses.push(harness);
  return harness;
}

afterEach((): void => {
  for (const harness of harnesses.splice(0)) { harness.app.unmount(); harness.client.clear(); }
  vi.unstubAllGlobals();
});

describe("public TanStack directory store", (): void => {
  it("keeps only public fields and excludes unsafe handles", (): void => {
    expect(parsePublicDirectory({ Members: [
      { ...DATA.Members[0], password: "private" },
      { FirstName: "Unsafe", LastName: null, GithubLogin: "x.example/path" },
    ], Mentors: [] })).toEqual(DATA);
    expect((): PublicDirectory => parsePublicDirectory({ Members: [] })).toThrow("Invalid public directory response");
  });

  it("deduplicates consumers, passes cancellation and caches fresh data", async (): Promise<void> => {
    let complete: (value: PublicDirectory) => void = (): void => {};
    const fetch: ReturnType<typeof vi.fn> = vi.fn((): Promise<PublicDirectory> => new Promise<PublicDirectory>((resolve): void => { complete = resolve; }));
    vi.stubGlobal("$fetch", fetch);
    const harness: Harness = mountStores();
    const first: ReturnType<Store["refetch"]> = harness.stores[0]!.refetch();
    const second: ReturnType<Store["refetch"]> = harness.stores[1]!.refetch();
    complete(DATA);
    await Promise.all([first, second]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/githubaccounts", { signal: expect.any(AbortSignal), retry: 0 });
    expect(harness.stores[1]!.data.value).toEqual(DATA);
    mountStores(harness.client);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows errors, retries and accepts empty directories", async (): Promise<void> => {
    const fetch: ReturnType<typeof vi.fn> = vi.fn().mockRejectedValueOnce(new Error("unavailable")).mockResolvedValue({ Members: [], Mentors: [] });
    vi.stubGlobal("$fetch", fetch);
    const store: Store = mountStores().stores[0]!;
    await store.refetch();
    expect(store.isError.value).toBe(true);
    await store.refetch();
    expect(store.isError.value).toBe(false);
    expect(store.data.value).toEqual({ Members: [], Mentors: [] });
  });

  it("retains cached content when a background refresh fails", async (): Promise<void> => {
    const fetch: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValueOnce(DATA).mockRejectedValue(new Error("refresh failed"));
    vi.stubGlobal("$fetch", fetch);
    const store: Store = mountStores().stores[0]!;
    await store.refetch();
    await store.refetch();
    expect(store.isError.value).toBe(true);
    expect(store.data.value).toEqual(DATA);
  });

  it("aborts in-flight requests when the query is cancelled", async (): Promise<void> => {
    let requestSignal: AbortSignal | undefined;
    const fetch: ReturnType<typeof vi.fn> = vi.fn((_url: string, options: { signal: AbortSignal }): Promise<never> => {
      requestSignal = options.signal;
      return new Promise<never>((_resolve, reject): void => {
        options.signal.addEventListener("abort", (): void => { reject(new Error("aborted")); });
      });
    });
    vi.stubGlobal("$fetch", fetch);
    const harness: Harness = mountStores();
    const pending: ReturnType<Store["refetch"]> = harness.stores[0]!.refetch();
    await harness.client.cancelQueries({ queryKey: ["public", "githubDirectory"] });
    await pending;
    expect(requestSignal?.aborted).toBe(true);
  });
});
