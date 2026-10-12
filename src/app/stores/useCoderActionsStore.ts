import { useMutation,useQueryClient } from "@tanstack/vue-query";
import type { Ref } from "vue";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";
import { goalUpdateSchema,type GoalFields,type GuardedUpdate } from "#shared/types/MemberMaintenance";
import { coderApplicationSchema,badgeGoalChangeSchema,applicationResultSchema,type CoderApplication,type BadgeGoalChange,type ApplicationResult } from "#shared/types/Coder";
type CoderWrite = {path:"goals";method:"PATCH";body:GuardedUpdate<GoalFields>}|{path:"badge-goal";method:"POST";body:BadgeGoalChange}|{path:"applications";method:"POST";body:CoderApplication};
type CoderActionsStore = {isSaving:Ref<boolean>;saveGoals:(body:GuardedUpdate<GoalFields>)=>Promise<null>;chooseGoal:(body:BadgeGoalChange)=>Promise<null>;apply:(body:CoderApplication)=>Promise<ApplicationResult>};
/** Own validated personal goal/application writes and invalidate every dependent view. */
export function useCoderActionsStore():CoderActionsStore {
 const headers:ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache:ReturnType<typeof useQueryClient> = useQueryClient();
 const mutation:ReturnType<typeof useMutation<unknown,Error,CoderWrite>> = useMutation<unknown,Error,CoderWrite>({mutationFn:async(write:CoderWrite):Promise<unknown>=>$fetch(`/api/Coder/${write.path}`,{method:write.method,body:write.body,headers:await headers()}),onSettled:async():Promise<void>=>{await Promise.all(["coder","profiles","achievementReviews","memberBeltsPending","memberBadgesByMemberId"].map((key:string):Promise<void>=>cache.invalidateQueries({queryKey:[key]})));}});
 /** Save the coder's short and long term goals using an exact baseline. */
 async function saveGoals(body:GuardedUpdate<GoalFields>):Promise<null> { await mutation.mutateAsync({path:"goals",method:"PATCH",body:goalUpdateSchema.parse(body)});return null; }
 /** Change a badge goal only while its original selection date is current. */
 async function chooseGoal(body:BadgeGoalChange):Promise<null> { await mutation.mutateAsync({path:"badge-goal",method:"POST",body:badgeGoalChangeSchema.parse(body)});return null; }
 /** Submit evidence and validate the server's idempotent application identity. */
 async function apply(body:CoderApplication):Promise<ApplicationResult> { return applicationResultSchema.parse(await mutation.mutateAsync({path:"applications",method:"POST",body:coderApplicationSchema.parse(body)})); }
 return {isSaving:mutation.isPending,saveGoals,chooseGoal,apply};
}
