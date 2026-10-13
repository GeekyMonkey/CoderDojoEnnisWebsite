<script setup lang="ts">
 import {computed,type ComputedRef} from "vue";
 import {profileIdentitySchema} from "#shared/types/MemberProfile";
 import {useParentChildStore} from "~/stores/useParentStore";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import PublicProfileDetails from "~/components/Profile/PublicProfileDetails.vue";
 import TeamRoster from "~/components/Teams/TeamRoster.vue";
 import MemberAttendanceHistory from "~/components/Maintenance/MemberAttendanceHistory.vue";
 import ChildAchievementList from "~/components/Achievements/ChildAchievementList.vue";
 import ChildAccount from "./ChildAccount.vue";
 import ChildImages from "./ChildImages.vue";
 import ParentContacts from "./ParentContacts.vue";
 import GoalsDisplay from "~/components/Profile/GoalsDisplay.vue";
 const props = defineProps<{memberId:string;section:"summary"|"account"|"images"|"goals"|"belts"|"badges"|"attendance"|"parents"}>();
 type ChildTab = {key:string;label:string;to:string};
 const {t} = useI18n();
 const {data,isPending,isError} = useParentChildStore(():string=>props.memberId);
 const valid:ComputedRef<boolean> = computed(():boolean=>profileIdentitySchema.safeParse(props.memberId).success);
 const tabs:ComputedRef<ChildTab[]> = computed(():ChildTab[]=>["summary","account","images","goals","belts","badges","attendance","parents"].map((key:string):ChildTab=>({key,label:t(`parent.${key}`),to:`/parent/kids/${props.memberId}${key==='summary'?'':`/${key}`}`})));
</script>
<template><UDashboardPanel :id="`parent-child-${section}`"><template #header><DashboardHeading :pageTitle="`${data?.member.nameFirst ?? ''} ${data?.member.nameLast ?? ''}`" :breadcrumbLabel="t('nav.My Kids')" breadcrumbTo="/parent/kids" /></template><template #body><div class="ChildPage"><UAlert v-if="!valid || isError" color="error" :title="t('profile.loadError')" /><p v-else-if="isPending">{{t('profile.loading')}}</p><template v-else-if="data"><nav class="ChildTabs" :aria-label="t('parent.childNavigation')"><UButton v-for="tab in tabs" :key="tab.key" :to="tab.to" :variant="section===tab.key?'solid':'outline'">{{tab.label}}</UButton></nav><div v-if="section!=='summary'">{{t('achievementReviews.currentBelt')}} <BeltColor :belt="data.currentBelt ?? 'noob'" mode="big" /></div><template v-if="section==='summary'"><PublicProfileDetails :member="data.member" :currentBelt="data.currentBelt" /><p>{{t('maintenance.sessionsCount',{count:data.attendanceCount})}}</p><UButton :to="`/parent/kids/${memberId}/passport`" icon="i-lucide-printer" variant="outline">{{t('printing.id')}}</UButton><TeamRoster :team="data.team" :members="data.roster" profileBase="/parent/team-members" /></template><ChildAccount v-else-if="section==='account'" :key="memberId" :member="data.member" /><ChildImages v-else-if="section==='images'" :key="memberId" :member="data.member" /><template v-else-if="section==='goals'"><GoalsDisplay :member="data.member" /><ChildAchievementList :memberId="memberId" kind="belt" mode="goals" /><ChildAchievementList :memberId="memberId" kind="badge" mode="goals" /></template><ChildAchievementList v-else-if="section==='belts' || section==='badges'" :key="section" :memberId="memberId" :kind="section==='belts'?'belt':'badge'" mode="all" /><MemberAttendanceHistory v-else-if="section==='attendance'" :memberId="memberId" parent /><ParentContacts v-else-if="section==='parents'" :parents="data.parents" /></template></div></template></UDashboardPanel></template>
<style scoped lang="scss">.ChildPage{display:grid;gap:calc(var(--spacing)*5);padding:calc(var(--spacing)*4);max-width:60rem;min-width:0;}.ChildTabs{display:flex;flex-wrap:wrap;gap:calc(var(--spacing)*2);}.ChildPage > :deep(a){max-width:100%;width:fit-content;justify-self:start;}</style>
