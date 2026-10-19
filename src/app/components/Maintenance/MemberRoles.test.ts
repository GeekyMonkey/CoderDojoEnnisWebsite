import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import MemberRoles from "./MemberRoles.vue";

type Roles = { isNinja: boolean; isParent: boolean; isMentor: boolean };

/** Render the role selector without requiring a browser or Nuxt UI runtime. */
async function renderRoles(roles: Roles, mode: "view" | "edit"): Promise<string> {
	vi.stubGlobal("useI18n", (): { t: (key: string) => string } => ({ t: (key: string): string => key }));
	const app: ReturnType<typeof createSSRApp> = createSSRApp(MemberRoles, { modelValue: roles, mode });
	const field: Component = defineComponent({
		props: ["name", "label", "required"],
		setup(props, { slots }): () => ReturnType<typeof h> {
			return (): ReturnType<typeof h> => h("div", { "data-required": props.required }, slots.default?.());
		},
	});
	const checkbox: Component = defineComponent({
		props: ["modelValue", "disabled", "label"],
		setup(props): () => ReturnType<typeof h> {
			return (): ReturnType<typeof h> => h("input", { type: "checkbox", checked: props.modelValue, disabled: props.disabled, "aria-label": props.label });
		},
	});
	app.component("UFormField", field);
	app.component("UCheckbox", checkbox);
	return renderToString(app);
}

afterEach((): void => { vi.unstubAllGlobals(); });

describe("profile role selector", (): void => {
	it("shows all three checkboxes and protects the final selected role", async (): Promise<void> => {
		const html: string = await renderRoles({ isNinja: false, isParent: false, isMentor: true }, "edit");
		expect(html.match(/type="checkbox"/g)).toHaveLength(3);
		expect(html).toContain('checked disabled aria-label="maintenance.isMentor"');
		expect(html).toContain('data-required=""');
	});
	it("allows changing either role when multiple roles are selected", async (): Promise<void> => {
		const html: string = await renderRoles({ isNinja: false, isParent: true, isMentor: true }, "edit");
		expect(html.match(/ checked/g)).toHaveLength(2);
		expect(html).not.toContain(" disabled");
	});
	it("keeps display mode free of editing inputs", async (): Promise<void> => {
		const html: string = await renderRoles({ isNinja: false, isParent: false, isMentor: true }, "view");
		expect(html).not.toContain("<input");
		expect(html).toContain("maintenance.isMentor");
	});
});
