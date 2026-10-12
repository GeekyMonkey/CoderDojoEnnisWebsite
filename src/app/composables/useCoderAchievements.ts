import { computed,type ComputedRef } from "vue";
import { useAchievementReviewsStore } from "~/stores/useAchievementReviewsStore";
import type { AchievementKind,AchievementReview } from "#shared/types/AchievementReview";
export type CoderAchievement = {review:AchievementReview;history:AchievementReview[];goalDate:number|null;earned:boolean;pending:boolean;canApply:boolean};
/** Derive one definition card per achievement without manufacturing database records. */
export function useCoderAchievements(kind:AchievementKind):{store:ReturnType<typeof useAchievementReviewsStore>;items:ComputedRef<CoderAchievement[]>;nextBelt:ComputedRef<string|null>;currentBelt:ComputedRef<AchievementReview|null>} {
 const store:ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore(kind,undefined,true);
 const nextBelt:ComputedRef<string|null> = computed(():string|null=>[...(store.data.value??[])].filter((review:AchievementReview):boolean=>!review.definitionDeleted && !(store.data.value??[]).some((other:AchievementReview):boolean=>other.definitionId===review.definitionId && other.awarded!==null)).sort((a:AchievementReview,b:AchievementReview):number=>a.sortOrder-b.sortOrder||a.label.localeCompare(b.label)||a.definitionId.localeCompare(b.definitionId))[0]?.definitionId??null);
 const currentBelt:ComputedRef<AchievementReview|null> = computed(():AchievementReview|null=>[...(store.data.value??[])].filter((review:AchievementReview):boolean=>review.awarded!==null).sort((a:AchievementReview,b:AchievementReview):number=>(b.awarded??0)-(a.awarded??0))[0]??null);
 const items:ComputedRef<CoderAchievement[]> = computed(():CoderAchievement[]=>{
  const grouped:Map<string,AchievementReview[]> = new Map();
  for(const row of store.data.value??[]){const values:AchievementReview[] = grouped.get(row.definitionId)??[];values.push(row);grouped.set(row.definitionId,values);}
  return [...grouped.values()].map((values:AchievementReview[]):CoderAchievement=>{
   const earned:boolean = values.some((row:AchievementReview):boolean=>row.awarded!==null);
   const pending:boolean = values.some((row:AchievementReview):boolean=>row.applicationDate!==null && row.awarded===null && row.rejectedDate===null);
   const review:AchievementReview = values.find((row:AchievementReview):boolean=>row.awarded!==null)??values.find((row:AchievementReview):boolean=>row.applicationDate!==null && row.rejectedDate===null)??values[0]!;
   const goalDates:number[] = values.filter((row:AchievementReview):boolean=>row.goalDate!==null && row.awarded===null).map((row:AchievementReview):number=>row.goalDate!);
   return {review,history:values.filter((row:AchievementReview):boolean=>row.applicationDate!==null||row.goalDate!==null).sort((a:AchievementReview,b:AchievementReview):number=>(b.applicationDate??b.goalDate??0)-(a.applicationDate??a.goalDate??0)),goalDate:earned||!goalDates.length?null:Math.max(...goalDates),earned,pending,canApply:!earned&&!pending&&!review.definitionDeleted&&(kind==="badge"||review.definitionId===nextBelt.value)};
  }).sort((a:CoderAchievement,b:CoderAchievement):number=>(a.review.categoryName??"").localeCompare(b.review.categoryName??"")||a.review.sortOrder-b.review.sortOrder||a.review.label.localeCompare(b.review.label));
 });
 return {store,items,nextBelt,currentBelt};
}
