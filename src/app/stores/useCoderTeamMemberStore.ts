import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from "vue";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import { teamMemberProfileSchema, type TeamMemberProfile } from "#shared/types/Coder";
import { useCoderQuery, type CoderQuery } from "./useCoderQuery";
/** Own an authorized teammate's read-only profile query. */
export function useCoderTeamMemberStore(id:MaybeRefOrGetter<string>):CoderQuery<TeamMemberProfile> {
 const path:ComputedRef<string|null> = computed(():string|null=>{const parsed:ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(toValue(id));return parsed.success?`team-members/${parsed.data}`:null;});
 return useCoderQuery(path,teamMemberProfileSchema);
}
