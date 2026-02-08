<script setup lang="ts">
	import type { AppConfig } from "@nuxt/schema";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { ComponentConfig } from "@nuxt/ui";
	import theme from "#build/ui/avatar";

	type Avatar = ComponentConfig<typeof theme, AppConfig, "avatar">;
	type LinkToOption = "NONE" | "HERE" | "NEW_TAB";

	const props = defineProps<{
		member: MemberModel;
		size: "sm" | "md" | "lg";
		linkTo?: LinkToOption;
	}>();

	const { MemberPhotoUrl, MemberAvatarUrl } = useUiConfig();
	const route = useRoute();

	// Determine the member profile link based on current route
	const memberLink = computed<string | null>(() => {
		const linkOption = props.linkTo || "NONE";
		if (linkOption === "NONE") {
			return null;
		}

		const currentPath = route.path.toLowerCase();
		const memberId = props.member.id;

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

	const linkTarget = computed<string | undefined>(() => {
		const linkOption = props.linkTo || "NONE";
		return linkOption === "NEW_TAB" ? "_blank" : undefined;
	});

	const src = computed(() => {
		if (props.member.hasPhoto) {
			return MemberPhotoUrl(props.member.id);
		}
		if (props.member.hasAvatar) {
			return MemberAvatarUrl(props.member.id);
		}
		return "nope";
	});

	const alt = computed(() => {
		const name =
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
		:target="linkTarget"
		class="MemberAvatarLink"
	>
		<UAvatar
			class="MemberAvatar"
			:src="src"
			:alt="alt"
			:title="alt"
			:style="{ width: avatarSize, height: avatarSize }"
			v-bind="$attrs"
		/>
	</NuxtLink>
	<UAvatar
		v-else
		class="MemberAvatar"
		:src="src"
		:alt="alt"
		:title="alt"
		:style="{ width: avatarSize, height: avatarSize }"
		v-bind="$attrs"
	/>
</template>

<style>
	.MemberAvatarLink {
		display: inline-block;
		text-decoration: none;
	}

	.MemberAvatar {
		&:has(span) {
			outline: dashed 1px var(--ui-border);
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
