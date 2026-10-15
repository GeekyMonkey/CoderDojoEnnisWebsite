import { it, expect } from "vitest";
import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import ShowcaseCard from "./ShowcaseCard.vue";
import type { ShowcaseItem } from "#shared/types/Showcase";
it("renders repeated project evidence with unique native disclosures and separate action buttons", async (): Promise<void> => {
	const item: ShowcaseItem = {
		id: "00000000-0000-4000-8000-000000000001",
		memberId: "00000000-0000-4000-8000-000000000002",
		title: "Game",
		description: "Evidence",
		projectType: "scratch",
		url: "https://scratch.mit.edu/projects/1",
		showcaseDate: "2026-10-15",
		isVisible: false,
		sourceProjectId: "1",
		thumbnailUrl: null,
		createdAt: "today",
		updatedAt: "today",
		memberName: "Coder",
		username: "coder",
		roles: ["coder"],
		avatarUrl: null,
		photoUrl: null,
	};
	const wrapper: Component = defineComponent({
		setup: () => () =>
			h("main", [
				h(
					ShowcaseCard,
					{ item },
					{ actions: () => h("button", { type: "button" }, "Delete link") },
				),
				h(ShowcaseCard, { item }),
			]),
	});
	const app: ReturnType<typeof createSSRApp> = createSSRApp(wrapper);
	app.component("UIcon", defineComponent({ setup: () => () => h("span") }));
	const html: string = await renderToString(app);
	const ids: string[] = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
		(match: RegExpMatchArray): string => match[1]!,
	);
	expect(ids).toHaveLength(2);
	expect(new Set(ids).size).toBe(2);
	for (const id of ids) expect(html).toContain(`id="${id}"`);
	expect(html).toMatch(
		/<\/button>.*showcase-card-actions.*<button type="button">Delete link<\/button>/s,
	);
	expect(html).toContain('target="_blank"');
	expect(html).toContain('aria-expanded="false"');
});
