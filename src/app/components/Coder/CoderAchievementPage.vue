<script setup lang="ts">
 import type { AchievementKind } from "#shared/types/AchievementReview";
 import CoderAchievementList from "./CoderAchievementList.vue";
 const props = defineProps<{kind:AchievementKind;mode:"earned"|"available"|"all"}>();
 const {pageTitle} = useMemberLayoutContext();
</script>
<template><UDashboardPanel :id="`coder-${kind}-${mode}`"><template #header><DashboardHeading :pageTitle="pageTitle" /></template><template #body><div class="AchievementPage"><CoderAchievementList :kind="kind" :mode="mode" /></div></template></UDashboardPanel></template>
<style scoped lang="scss">.AchievementPage { padding:calc(var(--spacing)*4); max-width:60rem; }</style>
