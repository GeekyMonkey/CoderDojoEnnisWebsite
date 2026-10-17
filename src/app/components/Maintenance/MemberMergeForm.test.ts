import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, type Ref, type ComputedRef, type SetupContext, type VNode } from "vue";
import { renderToString } from "vue/server-renderer";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { MemberMerge, MergeChoices, MergeImages, MergeSource } from "#shared/types/MemberMerge";
import MergeFieldChoice from "./MergeFieldChoice.vue";
import MemberMergeForm from "./MemberMergeForm.vue";

/** Build accounts with independent coder and mentor roles. */
function account(id: string, isNinja: boolean, isMentor: boolean): MemberModel {
 return { id, isNinja, isMentor, isParent: false, deleted: false, birthYear: null, email: null, fingerprintId: null, nfcTag: null, gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null, hasAvatar: false, hasPhoto: false, login: id, loginDate: null, loginDatePrevious: null, nameFirst: id, nameLast: null, phone: null, registeredCurrentTerm: false, scratchName: null, teamId: null, xboxGamertag: null };
}
afterEach((): void => { vi.unstubAllGlobals(); });
describe("merge candidate roles", (): void => {
 it.each([true, false])("offers the opposite role when survivor is coder=%s", async (keepCoder: boolean): Promise<void> => {
  vi.stubGlobal("useI18n", (): object => ({ t: (key: string): string => key }));
  const keep: MemberModel = account("survivor", keepCoder, !keepCoder);
  const duplicate: MemberModel = account("opposite-role", !keepCoder, keepCoder);
  const actor: MemberModel = account("acting-mentor", false, true);
  const app: ReturnType<typeof createSSRApp> = createSSRApp(MemberMergeForm, { member: keep, members: [keep, duplicate, actor], teams: [], actorId: actor.id, saving: false, merge: vi.fn() });
  app.component("UButton", { setup: (_props: unknown, { slots }: SetupContext): (() => VNode) => (): VNode => h("button", slots.default?.()) });
  app.component("UInput", { render: (): VNode => h("input") });
  const markup: string = await renderToString(app);
  expect(markup).toContain("opposite-role");
  expect(markup).not.toContain("acting-mentor");
  expect(markup).not.toContain("survivor");
 });
});

type ReviewState = {
 choose: (member: MemberModel) => void;
 selectSurvivor: (field: string, source: MergeSource) => void;
 change: (field: string, source: MergeSource) => void;
 selectImage: (field: string, source: MergeSource) => void;
 submit: () => Promise<void>;
 request: ComputedRef<MemberMerge | null>;
 choices: Ref<Partial<MergeChoices>>;
 imageChoices: Ref<Partial<MergeImages>>;
};
it("requires all decisions and submits the selected username with independent image choices", async (): Promise<void> => {
 vi.stubGlobal("useI18n", (): object => ({ t: (key: string): string => key }));
 const keep: MemberModel = { ...account("00000000-0000-4000-8000-000000000002", true, false), nameFirst: "Same", email: "first@example.invalid", hasPhoto: true, hasAvatar: true };
 const other: MemberModel = { ...account("00000000-0000-4000-8000-000000000003", false, true), nameFirst: "Same", email: "other@example.invalid", hasPhoto: true, hasAvatar: true };
 const merge: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(other);
 const emit: ReturnType<typeof vi.fn> = vi.fn();
 const props: object = { member: keep, members: [keep, other], teams: [], actorId: "actor", saving: false, merge };
 let state: ReviewState;
 // Run the actual component setup in an SSR instance so Nuxt/Vue injections are available.
 const setup: (props: object, context: object) => ReviewState = (MemberMergeForm as unknown as { setup: (props: object, context: object) => ReviewState }).setup;
 await renderToString(createSSRApp({ setup: (): (() => VNode) => {
  state = setup(props, { expose: (): void => {}, emit });
  return (): VNode => h("div");
 } }));
 state!.choose(other);
 expect(state!.choices.value).toEqual({}); expect(state!.imageChoices.value).toEqual({});
 expect(state!.request.value).toBeNull();
 await state!.submit(); expect(merge).not.toHaveBeenCalled();
 state!.selectSurvivor("login", "duplicate");
 state!.change("email", "keep");
 state!.selectImage("photo", "keep");
 expect(state!.request.value).toBeNull();
 await state!.submit(); expect(merge).not.toHaveBeenCalled();
 state!.selectImage("avatar", "duplicate");
 expect(state!.request.value).not.toBeNull();
 expect(merge).not.toHaveBeenCalled();
 await state!.submit();
 expect(merge).toHaveBeenCalledWith(other.id, expect.objectContaining({ duplicateId: keep.id, expectedKeep: expect.objectContaining({ id: other.id }), choices: expect.objectContaining({ email: "duplicate" }), images: { photo: "duplicate", avatar: "keep" } }));
 expect(emit).toHaveBeenCalledWith("merged", other);
 state!.choose(other);
 expect(state!.request.value).toBeNull();
});
it("renders two unselected required radio buttons for every review choice", async (): Promise<void> => {
 const markup: string = await renderToString(createSSRApp(MergeFieldChoice, { field: "email", label: "Email", keep: "first@example.invalid", duplicate: "second@example.invalid", disabled: false }));
 expect(markup.match(/type="radio"/g)).toHaveLength(2);
 expect(markup.match(/required/g)).toHaveLength(2);
 expect(markup).not.toContain("checked"); expect(markup).not.toContain("<select");
 expect(markup).toMatch(/<legend[^>]*>Email<\/legend>/);
 expect(markup).toContain("first@example.invalid"); expect(markup).toContain("second@example.invalid");
});
