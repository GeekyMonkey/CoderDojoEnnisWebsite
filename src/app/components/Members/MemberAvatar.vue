<script setup lang="ts">
	import type { AppConfig } from "@nuxt/schema";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import type { ComponentConfig } from "@nuxt/ui";
	import theme from "#build/ui/avatar";

	type Avatar = ComponentConfig<typeof theme, AppConfig, "avatar">;

	const props = defineProps<{
		member: MemberModel;
		size: "sm" | "md" | "lg";
	}>();

	const { MemberPhotoUrl, MemberAvatarUrl } = useUiConfig();

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
	<UAvatar
		class="MemberAvatar"
		:src="src"
		:alt="alt"
		:style="{ width: avatarSize, height: avatarSize }"
		v-bind="$attrs"
	/>
</template>

<style>
	.MemberAvatar {
		&:has(span) {
			outline: dashed 1px var(--ui-border);
		}
	}
</style>
