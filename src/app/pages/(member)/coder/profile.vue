<script setup lang="ts">
 import { useCoderContextStore } from "~/stores/useCoderContextStore";
 import TeamRoster from "~/components/Teams/TeamRoster.vue";
 const { t } = useI18n();
 const {data,isPending,isError} = useCoderContextStore();
</script>
<template><MyProfilePage><template #roleDetails="{member}"><p>{{ t('maintenance.birthYear') }}: {{ member.birthYear ?? '—' }}</p><UButton to="/coder/passport" icon="i-lucide-printer" class="PassportAction">{{ t('printing.id') }}</UButton><p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><TeamRoster v-else-if="data" :team="data.team" :members="data.roster" profileBase="/coder/team-members" /></template></MyProfilePage></template>
<style scoped lang="scss">.PassportAction { justify-self:start; }</style>
