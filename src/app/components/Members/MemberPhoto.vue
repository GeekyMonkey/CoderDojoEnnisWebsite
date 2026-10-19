<script setup lang="ts">
	import type { MemberImageMode, MemberImageSubject } from "#shared/types/MemberPresentation";
	import MemberImage from "./MemberImage.vue";
	const props = defineProps<{ member: MemberImageSubject; mode?: MemberImageMode; size?: "sm" | "md" | "lg"; linkTo?: "NONE" | "HERE" | "NEW_TAB"; borderColor?: string | null }>();
</script>
<template>
	<MemberImage :member="props.member" :mode="props.mode ?? 'PHOTO_INITIALS'" :size="props.size ?? 'md'" :linkTo="props.linkTo" :borderColor="props.borderColor" />
</template>
