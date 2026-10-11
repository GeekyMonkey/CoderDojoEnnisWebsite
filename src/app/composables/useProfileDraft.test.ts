import { describe, expect, it } from "vitest";
import { effectScope, nextTick, ref, type EffectScope, type Ref } from "vue";
import type { MemberModel } from "#shared/types/models/MemberModel";
import { useProfileDraft } from "./useProfileDraft";

const MEMBER: MemberModel = {
	id: "first", deleted: false, birthYear: null, email: null, fingerprintId: null, nfcTag: null,
	gardaVetted: false, githubLogin: null, goalLongTerm: null, goalShortTerm: null,
	hasAvatar: false, hasPhoto: false, isMentor: true, isNinja: false, isParent: false,
	login: null, loginDate: null, loginDatePrevious: null, nameFirst: "Example", nameLast: "Mentor",
	phone: null, registeredCurrentTerm: false, scratchName: null, teamId: null, xboxGamertag: null,
};

describe("reusable profile drafts", (): void => {
 it("preserves a login draft on remote changes and restores it on cancel", async (): Promise<void> => {
  const member: Ref<MemberModel> = ref({ ...MEMBER, login: "original" });
  const scope: EffectScope = effectScope();
  const draft: ReturnType<typeof useProfileDraft> | undefined = scope.run((): ReturnType<typeof useProfileDraft> => useProfileDraft(member));
  if (!draft) throw new Error("Missing draft scope");
  try {
   draft.fields.login = "local";
   member.value = { ...member.value, login: "remote" };
   await nextTick();
   expect(draft.fields.login).toBe("local");
   expect(draft.remoteChanged.value).toBe(true);
   draft.reset(member.value);
   expect(draft.fields.login).toBe("remote");
   expect(draft.dirty.value).toBe(false);
  } finally { scope.stop(); }
 });
	it("refreshes clean forms, preserves dirty edits and resets on identity changes", async (): Promise<void> => {
		const member: Ref<MemberModel> = ref({ ...MEMBER });
		const scope: EffectScope = effectScope();
		const draft: ReturnType<typeof useProfileDraft> | null = scope.run((): ReturnType<typeof useProfileDraft> => useProfileDraft(member)) ?? null;
		if (!draft) throw new Error("Missing draft scope");
		try {
			member.value = { ...MEMBER, phone: "updated" };
			await nextTick();
			expect(draft.fields.phone).toBe("updated");
			draft.fields.nameFirst = "Local edit";
			member.value = { ...member.value, phone: "remote edit" };
			await nextTick();
			expect(draft.fields.nameFirst).toBe("Local edit");
			expect(draft.remoteChanged.value).toBe(true);
			draft.reset(member.value);
			expect(draft.dirty.value).toBe(false);
			member.value = { ...MEMBER, id: "second" };
			await nextTick();
			expect(draft.fields.nameFirst).toBe("Example");
		} finally { scope.stop(); }
	});
});
