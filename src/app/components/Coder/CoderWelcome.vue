<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 const props = defineProps<{ member: MemberModel; attendanceCount: number | null; teamName: string | null }>();
 const { t, locale } = useI18n();
 const previousLogin: ComputedRef<string | null> = computed((): string | null => props.member.loginDatePrevious === null
  ? null : new Intl.DateTimeFormat(locale.value, { dateStyle: "medium", timeStyle: "short" }).format(props.member.loginDatePrevious));
</script>

<template>
 <UPageCard :title="t(member.loginDatePrevious === null ? 'coder.welcome' : 'coder.welcomeBack', { name: member.nameFirst ?? '' })">
  <p>{{ teamName === null ? t('coder.unassigned') : t('coder.yourTeam', { name: teamName }) }}</p>
  <p v-if="previousLogin !== null">{{ t('coder.previousLogin', { date: previousLogin }) }}</p>
  <p v-if="attendanceCount !== null">{{ t('maintenance.sessionsCount', { count: attendanceCount }) }}</p>
  <slot />
 </UPageCard>
</template>
