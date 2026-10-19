<script setup lang="ts">
 import {useCoderContextStore} from "~/stores/useCoderContextStore";
 import {useCoderActionsStore} from "~/stores/useCoderActionsStore";
 import MemberGoals from "~/components/Maintenance/MemberGoals.vue";
 import CoderAchievementList from "~/components/Coder/CoderAchievementList.vue";
 const {pageTitle} = useMemberLayoutContext();
 const {t} = useI18n();
 const {data,isPending,isError} = useCoderContextStore();
 const {isSaving,saveGoals} = useCoderActionsStore();
</script>
<template><UDashboardPanel id="coder-goals"><template #header><DashboardHeading :pageTitle="pageTitle" /></template><template #body><div class="GoalsPage"><p v-if="isPending">{{t('profile.loading')}}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><MemberGoals mode="edit" v-else-if="data" :member="data.member" :saving="isSaving" :save="saveGoals" :showProgress="false" /><CoderAchievementList kind="belt" mode="goals" /><CoderAchievementList kind="badge" mode="goals" /><UButton to="/coder/badges-available" variant="outline">{{t('coder.chooseBadges')}}</UButton></div></template></UDashboardPanel></template>
<style scoped lang="scss">.GoalsPage {display:grid;gap:calc(var(--spacing)*5);padding:calc(var(--spacing)*4);max-width:60rem;}</style>
