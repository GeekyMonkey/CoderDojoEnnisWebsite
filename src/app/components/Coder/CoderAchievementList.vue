<script setup lang="ts">
 import {computed,type ComputedRef} from "vue";
 import type {AchievementKind} from "#shared/types/AchievementReview";
 import {useCoderAchievements,type CoderAchievement} from "~/composables/useCoderAchievements";
 import {useCoderActionsStore} from "~/stores/useCoderActionsStore";
 import {useActionNotifications} from "~/composables/useActionNotifications";
 import {requestFailureMessage} from "#shared/utils/RequestFailure";
 import AchievementCard from "~/components/Achievements/AchievementCard.vue";
 import AchievementApplicationForm from "~/components/Achievements/AchievementApplicationForm.vue";
 import CollapsibleSection from "~/components/Layout/CollapsibleSection.vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const props = withDefaults(defineProps<{kind:AchievementKind;mode:"earned"|"available"|"all"|"goals";interactive?:boolean}>(),{interactive:true});
 type CategoryGroup = {name:string;items:CoderAchievement[]};
 type Group = {key:string;items:CoderAchievement[]};
 const {t} = useI18n();
 const {publish} = useActionNotifications();
 const {store,items,nextBelt,currentBelt} = useCoderAchievements(props.kind);
 const actions:ReturnType<typeof useCoderActionsStore> = useCoderActionsStore();
 const groups:ComputedRef<Group[]> = computed(():Group[]=>{
  if(props.mode==="goals")return [{key:props.kind==="belt"?"nextBelt":"badgeGoals",items:items.value.filter((item:CoderAchievement):boolean=>props.kind==="belt"?item.review.definitionId===nextBelt.value:item.goalDate!==null)}];
  const keys:string[] = props.mode==="earned"?["pending","awarded"]:props.mode==="available"?["pending","available"]:["awarded","pending","available"];
  return keys.map((key:string):Group=>({key,items:items.value.filter((item:CoderAchievement):boolean=>key==="awarded"?item.earned:key==="pending"?item.pending:!item.earned&&!item.pending&&!item.review.definitionDeleted)}));
 });
 const categories:ComputedRef<Record<string,CategoryGroup[]>> = computed(():Record<string,CategoryGroup[]>=>Object.fromEntries(groups.value.map((group:Group):[string,CategoryGroup[]]=>{
  const map:Map<string,CoderAchievement[]> = new Map();
  for(const item of group.items){const name:string = props.kind==="badge"?item.review.categoryName??t("definitionMaintenance.unavailableCategory"):"";const values:CoderAchievement[] = map.get(name)??[];values.push(item);map.set(name,values);}
  return [group.key,[...map.entries()].map(([name,values]:[string,CoderAchievement[]]):CategoryGroup=>({name,items:values}))];
 })));
 /** Select or remove a goal through the store with its current aggregate baseline. */
 async function goal(item:CoderAchievement):Promise<void>{
  try{await actions.chooseGoal({definitionId:item.review.definitionId,selected:item.goalDate===null,expectedGoalDate:item.goalDate});publish({name:"coder.goal.saved",severity:"success",message:t("actionNotifications.saved")});}
  catch(error:unknown){publish({name:"coder.goal.error",severity:"error",message:requestFailureMessage(error)??t("profile.saveError")});}
 }
 /** Submit validated evidence for this own-member achievement. */
 async function apply(item:CoderAchievement,notes:string):Promise<unknown>{return actions.apply({kind:props.kind,definitionId:item.review.definitionId,notes});}
</script>
<template><section class="CoderAchievements"><span v-if="kind==='belt'">{{ t('achievementReviews.currentBelt') }} <BeltColor :belt="currentBelt?.belt ?? 'noob'" size="md" /></span><p v-if="store.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="store.isError.value" color="error" :title="t('achievementReviews.loadError')" /><template v-else><section v-for="group in groups" :key="group.key" class="AchievementGroup"><h2>{{ t(`achievementReviews.${group.key}`) }} ({{group.items.length}})</h2><p v-if="!group.items.length">{{t('achievementReviews.empty')}}</p><CollapsibleSection v-for="category in categories[group.key] ?? []" :key="category.name" :title="kind==='badge'?`${category.name} (${category.items.length})`:null" :open="group.key==='pending' || mode==='goals'"><AchievementCard v-for="item in category.items" :key="item.review.definitionId" :review="item.review" :history="item.history" :goalDate="item.goalDate" :open="item.pending || mode==='goals'"><UButton v-if="interactive && kind==='badge' && !item.earned && !item.review.definitionDeleted" variant="outline" :disabled="actions.isSaving.value" @click="goal(item)">{{t(item.goalDate===null?'coder.chooseGoal':'coder.removeGoal')}}</UButton><AchievementApplicationForm v-if="interactive && item.canApply" :saving="actions.isSaving.value" :apply="(notes:string):Promise<unknown>=>apply(item,notes)" /></AchievementCard></CollapsibleSection></section></template></section></template>
<style scoped lang="scss">.CoderAchievements,.AchievementGroup { display:grid; gap:calc(var(--spacing)*4); min-width:0; } h2 { font-size:var(--text-lg);font-weight:600; }</style>
