import { effectScope, nextTick, ref, type EffectScope, type Ref } from "vue";
import { describe, expect, it } from "vitest";
import { useMemberSectionDraft } from "./useMemberSectionDraft";
import { goalSnapshot } from "#shared/types/MemberMaintenance";
import type { MemberModel } from "#shared/types/models/MemberModel";

describe("section drafts", (): void => {
	it("refreshes clean goals but preserves dirty goals when a remote edit arrives", async (): Promise<void> => {
		const member: Ref<MemberModel> = ref({ id: "a", goalShortTerm: "original", goalLongTerm: null } as MemberModel);
		const scope: EffectScope = effectScope();
		const draft: ReturnType<typeof useMemberSectionDraft<ReturnType<typeof goalSnapshot>>> = scope.run(() => useMemberSectionDraft((): MemberModel => member.value, goalSnapshot))!;
		member.value = { ...member.value, goalShortTerm: "remote clean" }; await nextTick();
		expect(draft.fields.goalShortTerm).toBe("remote clean");
		draft.fields.goalShortTerm = "my draft";
		member.value = { ...member.value, goalShortTerm: "remote edit" }; await nextTick();
		expect(draft.fields.goalShortTerm).toBe("my draft"); expect(draft.remoteChanged.value).toBe(true);
		draft.reset(); expect(draft.fields.goalShortTerm).toBe("remote edit"); expect(draft.dirty.value).toBe(false);
		scope.stop();
	});
});
