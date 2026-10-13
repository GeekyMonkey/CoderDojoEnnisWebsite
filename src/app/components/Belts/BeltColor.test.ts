import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import type { BeltModel } from "#shared/types/models/BeltModel";
import BeltColor from "./BeltColor.vue";

const black: BeltModel = { id: "black", color: "black", hexCode: "#000000", description: "Teach others and lead a project.", deleted: false, sortOrder: 6 };

// Render the display with a modal shell that exposes its accessible details.
async function render(props: Record<string, unknown>): Promise<string> {
 vi.stubGlobal("useI18n", (): object => ({ t: (key: string): string => key }));
 const app: ReturnType<typeof createSSRApp> = createSSRApp(BeltColor, props);
 app.component("UModal", defineComponent({ props: ["title", "description"], setup: (modal, { slots }) => (): ReturnType<typeof h> => h("section", { "data-title": modal.title, "data-description": modal.description }, [slots.default?.(), slots.body?.()]) }));
 return renderToString(app);
}
afterEach((): void => { vi.unstubAllGlobals(); });
describe("shared belt display", (): void => {
 it("gives the black belt readable text and its description in large size", async (): Promise<void> => {
  const html: string = await render({ belt: black, size: "lg" });
  expect(html).toContain('type="button"');
  expect(html).toContain('aria-haspopup="dialog"');
  expect(html).toContain("Teach others and lead a project.");
  expect(html).toContain("--belt-foreground:#fff");
 });
 it("keeps table strips compact and non-interactive", async (): Promise<void> => {
  const html: string = await render({ belt: black, size: "sm" });
  expect(html).toContain("Size_sm");
  expect(html).toContain('aria-label="memberBelt.label"');
  expect(html).not.toContain('type="button"');
  expect(html).not.toContain("Teach others and lead a project.");
  expect(html).not.toContain("ShowLabel");
 });
 it("supports medium displays without table label overrides", async (): Promise<void> => {
  const html: string = await render({ belt: black, size: "md" });
  expect(html).toContain("Size_md");
  expect(html).toContain('aria-haspopup="dialog"');
 });
 it("uses dark text on light custom belt colors", async (): Promise<void> => {
  const html: string = await render({ belt: { ...black, hexCode: "#fff" } });
  expect(html).toContain("--belt-foreground:#000");
 });
 it("describes the no-belt state without fetching a directory", async (): Promise<void> => {
  const html: string = await render({ belt: null });
  expect(html).toContain("memberBelt.noobDescription");
 });
 it("handles missing descriptions and custom labels", async (): Promise<void> => {
  const html: string = await render({ belt: { ...black, description: " " }, labelOverride: "Advanced belt" });
  expect(html).toContain('data-title="Advanced belt"');
  expect(html).toContain("memberBelt.noDescription");
 });
});
