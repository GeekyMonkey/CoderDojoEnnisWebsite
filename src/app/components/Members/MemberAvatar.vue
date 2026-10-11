<script setup lang="ts">
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import MemberImage from "./MemberImage.vue";
	const props = defineProps<{ member: MemberModel; size?: "sm" | "md" | "lg"; linkTo?: "NONE" | "HERE" | "NEW_TAB"; borderColor?: string | null }>();
</script>
<template>
	<MemberImage :member="props.member" kind="avatar" :size="props.size ?? 'md'" :linkTo="props.linkTo" :borderColor="props.borderColor" />
</template>
