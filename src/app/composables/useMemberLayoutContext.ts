import { computed, inject, provide, type ComputedRef } from "vue";

export type MemberLayoutContext = {
	pageTitle: ComputedRef<string>;
};

const MemberLayoutContextKey = Symbol("MemberLayoutContext");

export function provideMemberLayoutContext(context: MemberLayoutContext) {
	provide(MemberLayoutContextKey, context);
}

export function useMemberLayoutContext(): MemberLayoutContext {
	const context = inject<MemberLayoutContext | null>(
		MemberLayoutContextKey,
		null,
	);
	if (context) return context;

	return {
		pageTitle: computed(() => ""),
	};
}
