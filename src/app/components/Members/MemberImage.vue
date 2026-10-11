<script setup lang="ts">
	import { ref, watch, type Ref } from "vue";
		import type { MemberModel } from "#shared/types/models/MemberModel";
		
	type LinkToOption = "NONE" | "HERE" | "NEW_TAB";

	const props = defineProps<{
		member: MemberModel;
		kind: "photo" | "avatar";
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

		// Determine role prefix from current route
		let rolePrefix: string | null = null;
		if (currentPath.startsWith("/mentor/")) {
			rolePrefix = "/mentor";
		} else if (currentPath.startsWith("/coder/")) {
			rolePrefix = "/coder";
		} else if (currentPath.startsWith("/parent/")) {
			rolePrefix = "/parent";
		}

		// Disable link if route doesn't match known patterns
		if (!rolePrefix) {
			return null;
		}

		if (rolePrefix === "/mentor") return `/mentor/member/${memberId}`;

		// Determine member type
		let memberType: string;
		if (props.member.isMentor) {
			memberType = "mentor";
		} else if (props.member.isNinja) {
			memberType = "coder";
		} else {
			// Default to parent if neither mentor nor coder
			memberType = "parent";
		}

		return `${rolePrefix}/${memberType}/${memberId}`;
	});

	const linkTarget = computed<string | null>(() => {
		const linkOption: LinkToOption = props.linkTo || "NONE";
		return linkOption === "NEW_TAB" ? "_blank" : null;
	});

	const legacy: Ref<boolean> = ref(false);
	const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);
	watch((): MemberModel => props.member, (): void => { legacy.value = false; refreshImages(); });
	/** Resolve only the requested image, with a legacy JPEG fallback. */
	const src = computed<string | null>(() => {
		const available: boolean = props.kind === "photo" ? props.member.hasPhoto : props.member.hasAvatar;
		if (!available) return null;
		const url: string = props.kind === "photo" ? MemberPhotoUrl(props.member.id) : MemberAvatarUrl(props.member.id);
		return `${legacy.value ? url : url.replace(/\.jpg$/, ".png")}?v=${revision.value}`;
	});

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
			:class="['MemberImage', { SquareImage: kind === 'avatar', PhotoImage: kind === 'photo' }]"
	    @error="legacy = true"
			:src="src ?? undefined"
			:alt="alt"
			:title="alt"
			:style="{ width: avatarSize, height: avatarSize, '--member-image-border': borderColor ?? 'transparent' }"
			v-bind="$attrs"
		/>
	</NuxtLink>
	<UAvatar
		v-else
		:class="['MemberImage', { SquareImage: kind === 'avatar', PhotoImage: kind === 'photo' }]"
	    @error="legacy = true"
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
