<script setup lang="ts">
 import type {AchievementKind} from "#shared/types/AchievementReview";
 import {useCoderAchievements,type CoderAchievement} from "~/composables/useCoderAchievements";
 import {useCoderActionsStore} from "~/stores/useCoderActionsStore";
 import {useActionNotifications} from "~/composables/useActionNotifications";
 import {requestFailureMessage} from "#shared/utils/RequestFailure";
 import AchievementList from "~/components/Achievements/AchievementList.vue";
 import AchievementApplicationForm from "~/components/Achievements/AchievementApplicationForm.vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const props = withDefaults(defineProps<{kind:AchievementKind;mode:"earned"|"available"|"all"|"goals";interactive?:boolean}>(),{interactive:true});
 const {t} = useI18n();
 const {publish} = useActionNotifications();
 const {store,items,nextBelt,currentBelt} = useCoderAchievements(props.kind);
 const actions:ReturnType<typeof useCoderActionsStore> = useCoderActionsStore();
 /** Select or remove a goal through the store with its current aggregate baseline. */
 async function goal(item:CoderAchievement):Promise<void>{
  try{await actions.chooseGoal({definitionId:item.review.definitionId,selected:item.goalDate===null,expectedGoalDate:item.goalDate});publish({name:"coder.goal.saved",severity:"success",message:t("actionNotifications.saved")});}
  catch(error:unknown){publish({name:"coder.goal.error",severity:"error",message:requestFailureMessage(error)??t("profile.saveError")});}
 }
 /** Submit validated evidence for this own-member achievement. */
 async function apply(item:CoderAchievement,notes:string):Promise<unknown>{return actions.apply({kind:props.kind,definitionId:item.review.definitionId,notes});}
</script>
<template><section class="CoderAchievements"><div v-if="kind==='belt'">{{t('achievementReviews.currentBelt')}} <BeltColor :belt="currentBelt?.belt ?? 'noob'" mode="big" /></div><p v-if="store.isPending.value">{{t('profile.loading')}}</p><UAlert v-else-if="store.isError.value" color="error" :title="t('achievementReviews.loadError')" /><AchievementList v-else :kind="kind" :mode="mode" :items="items" :nextBelt="nextBelt"><template #default="{item}"><UButton v-if="interactive && kind==='badge' && !item.earned && !item.review.definitionDeleted" variant="outline" :disabled="actions.isSaving.value" @click="goal(item)">{{t(item.goalDate===null?'coder.chooseGoal':'coder.removeGoal')}}</UButton><AchievementApplicationForm v-if="interactive && item.canApply" :saving="actions.isSaving.value" :apply="(notes:string):Promise<unknown>=>apply(item,notes)" /></template></AchievementList></section></template>
<style scoped lang="scss">.CoderAchievements,.AchievementGroup { display:grid; gap:calc(var(--spacing)*4); min-width:0; } h2 { font-size:var(--text-lg);font-weight:600; }</style>
