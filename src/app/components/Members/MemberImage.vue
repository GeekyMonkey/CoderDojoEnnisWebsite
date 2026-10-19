<script setup lang="ts">
	import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
		import type { MemberImageMode, MemberImageSubject } from "#shared/types/MemberPresentation";

	import { memberImageCandidates, memberImageIsRound, type MemberImageCandidate } from "~/utils/memberImages";

	type LinkToOption = "NONE" | "HERE" | "NEW_TAB";

	const props = defineProps<{
		member: MemberImageSubject;
		mode?: MemberImageMode;
		kind?: "photo" | "avatar";
		borderColor?: string | null;
		size: "sm" | "md" | "lg";
		linkTo?: LinkToOption;
	}>();

	const { MemberPhotoUrl, MemberAvatarUrl } = useUiConfig();
	const route: ReturnType<typeof useRoute> = useRoute();

	// Determine the member profile link based on current route
	const memberLink = computed<string | null>(() => {
		const linkOption: LinkToOption = props.linkTo || "NONE";
		if (linkOption === "NONE") {
			return null;
		}

		const currentPath: string = route.path.toLowerCase();
		const memberId: string = props.member.id;

		return ["/mentor/", "/parent/", "/coder/", "/member/"].some((prefix: string): boolean => currentPath.startsWith(prefix)) ? `/member/member/${memberId}` : null;
	});

	const linkTarget = computed<string | null>(() => {
		const linkOption: LinkToOption = props.linkTo || "NONE";
		return linkOption === "NEW_TAB" ? "_blank" : null;
	});

	const candidateIndex: Ref<number> = ref(0);
	const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);
	const mode: ComputedRef<MemberImageMode> = computed((): MemberImageMode => props.mode ?? (props.kind === "photo" ? "PHOTO_INITIALS" : "AVATAR_INITIALS"));
	const round: ComputedRef<boolean> = computed((): boolean => memberImageIsRound(mode.value));
	const candidates: ComputedRef<MemberImageCandidate[]> = computed((): MemberImageCandidate[] => memberImageCandidates(props.member, mode.value, MemberPhotoUrl(props.member.id), MemberAvatarUrl(props.member.id), revision.value));
	const src: ComputedRef<string | null> = computed((): string | null => candidates.value[candidateIndex.value]?.url ?? null);
	/** Advance from PNG to legacy JPEG, then the next preferred image or initials. */
	function imageFailed(): void { candidateIndex.value = Math.min(candidateIndex.value + 1, candidates.value.length); }
	watch(candidates, (): void => { candidateIndex.value = 0; }, { flush: "sync" });
	watch((): MemberImageSubject => props.member, (): void => { refreshImages(); });

	const alt = computed<string>(() => {
		const name: string =
			`${props.member.nameFirst || ""} ${props.member.nameLast || ""}`.trim();
		return name || props.member.login || "?";
	});

	const avatarSize = computed<string>(() => {
		switch (props.size || "md") {
			case "sm":
				return "32px";
			case "md":
				return "48px";
			case "lg":
				return "64px";
		}
	});
</script>

<template>
	<NuxtLink
		v-if="memberLink"
		:to="memberLink"
		:target="linkTarget ?? undefined"
		class="MemberAvatarLink"
	>
		<UAvatar
			:key="src ?? 'initials'"
			:class="['MemberImage', { SquareImage: !round, PhotoImage: round }]"
	    @error="imageFailed"
			:src="src ?? undefined"
			:alt="alt"
			:title="alt"
			:style="{ width: avatarSize, height: avatarSize, '--member-image-border': borderColor ?? 'transparent' }"
			v-bind="$attrs"
		/>
	</NuxtLink>
	<UAvatar
			:key="src ?? 'initials'"
		v-else
		:class="['MemberImage', { SquareImage: !round, PhotoImage: round }]"
	    @error="imageFailed"
		:src="src ?? undefined"
		:alt="alt"
		:title="alt"
		:style="{ width: avatarSize, height: avatarSize, '--member-image-border': borderColor ?? 'transparent' }"
		v-bind="$attrs"
	/>
</template>

<style scoped lang="scss">
	.MemberAvatarLink {
		display: inline-block;
		text-decoration: none;
	}

	.PhotoImage :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: center; }
	.SquareImage :deep(img) { object-fit: contain; }
	.SquareImage { border-radius: 0 !important; }
	.MemberImage {
		flex-shrink: 0;
		border-radius: 50%;
		outline: 3px solid var(--member-image-border);
		outline-offset: 2px;
		&:has(span) {

			display: flex;
			align-items: center;
			justify-content: center;
		}

		span {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
		}
	}
</style>
