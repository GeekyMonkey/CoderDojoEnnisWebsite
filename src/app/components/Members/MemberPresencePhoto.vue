<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import MemberPhoto from "./MemberPhoto.vue";
	const props = defineProps<{ member: MemberModel; present: boolean | null; size?: "sm" | "md" | "lg" }>();
	const { t } = useI18n();
	const present: ComputedRef<boolean | null> = computed((): boolean | null => props.present);
	const borderColor: ComputedRef<string | null> = computed((): string | null => present.value === null ? null : present.value ? "var(--color-green-500)" : props.member.registeredCurrentTerm ? "var(--color-orange-500)" : "var(--color-red-500)");
	const statusLabel: ComputedRef<string> = computed((): string => present.value === null ? t("profile.loading") : present.value ? t("attendance.columns.present") : props.member.registeredCurrentTerm ? t("maintenance.registeredCurrentTerm") : t("attendance.include.otherMembers"));
</script>
<template>
	<span :title="statusLabel"><MemberPhoto :member="member" :size="size ?? 'sm'" :borderColor="borderColor" /></span>
</template>
