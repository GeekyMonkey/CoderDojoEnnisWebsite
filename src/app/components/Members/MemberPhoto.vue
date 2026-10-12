<script setup lang="ts">
	import type { MemberImageSubject } from "#shared/types/MemberPresentation";
	import MemberImage from "./MemberImage.vue";
	const props = defineProps<{ member: MemberImageSubject; size?: "sm" | "md" | "lg"; linkTo?: "NONE" | "HERE" | "NEW_TAB"; borderColor?: string | null }>();
</script>
<template>
	<MemberImage :member="props.member" kind="photo" :size="props.size ?? 'md'" :linkTo="props.linkTo" :borderColor="props.borderColor" />
</template>
