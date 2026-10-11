<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import MemberPhoto from "./MemberPhoto.vue";
	const props = defineProps<{ member: MemberModel; size?: "sm" | "md" | "lg" }>();
	const { t } = useI18n();
	const attendance: ReturnType<typeof useMemberAttendanceStore> = useMemberAttendanceStore();
	const session: ReturnType<typeof attendance.useSessionAttendanceForDate> = attendance.useSessionAttendanceForDate(attendance.CurrentSessionDate);
	const present: ComputedRef<boolean | null> = computed((): boolean | null => session.data.value ? session.data.value.memberIds.includes(props.member.id) : null);
	const borderColor: ComputedRef<string | null> = computed((): string | null => present.value === null ? null : present.value ? "var(--color-green-500)" : props.member.registeredCurrentTerm ? "var(--color-orange-500)" : "var(--color-red-500)");
	const statusLabel: ComputedRef<string> = computed((): string => present.value === null ? t("profile.loading") : present.value ? t("attendance.columns.present") : props.member.registeredCurrentTerm ? t("maintenance.registeredCurrentTerm") : t("attendance.include.otherMembers"));
</script>
<template>
	<span :title="statusLabel"><MemberPhoto :member="member" :size="size ?? 'sm'" :borderColor="borderColor" /></span>
</template>
