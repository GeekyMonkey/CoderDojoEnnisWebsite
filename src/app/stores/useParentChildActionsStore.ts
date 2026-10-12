import {useMutation,useQueryClient} from "@tanstack/vue-query";
import {toValue,type MaybeRefOrGetter,type Ref} from "vue";
import {useProfileAuthorization} from "~/composables/useProfileAuthorization";
import {childMemberSchema,childUpdateSchema,passwordResetSchema,type ChildMember,type ChildUpdate,type PasswordReset} from "#shared/types/Parent";
import {profileIdentitySchema} from "#shared/types/MemberProfile";
import {profileImageActionSchema,type ProfileImageAction} from "#shared/types/ProfileImages";
import {useProfileImageRevision} from "~/composables/useProfileImageRevision";
type ChildActions = {save:(update:ChildUpdate)=>Promise<ChildMember>;resetPassword:(value:PasswordReset)=>Promise<null>;changeImages:(action:ProfileImageAction)=>Promise<ChildMember>;isSaving:Ref<boolean>;isResetting:Ref<boolean>;isSavingImages:Ref<boolean>};
/** Own the linked-child edit boundary, input/output validation and cross-screen cache invalidation. */
export function useParentChildActionsStore(memberId:MaybeRefOrGetter<string>):ChildActions{
 const headers:ReturnType<typeof useProfileAuthorization> = useProfileAuthorization();
 const cache:ReturnType<typeof useQueryClient> = useQueryClient();
 const {refresh:refreshImages} = useProfileImageRevision(():string=>toValue(memberId));
 /** Resolve a validated identity for every action rather than closing over a stale route. */
 function path():string{return `/api/Parent/children/${profileIdentitySchema.parse(toValue(memberId))}`;}
 /** Refresh all relevant parent, profile and maintenance queries even after conflicts. */
 async function refresh():Promise<void>{refreshImages();await Promise.all(["parent","profiles","memberMaintenance","members"].map((key:string):Promise<void>=>cache.invalidateQueries({queryKey:[key]})));}
 const save:ReturnType<typeof useMutation<ChildMember,Error,ChildUpdate>> = useMutation({mutationFn:async(value:ChildUpdate):Promise<ChildMember>=>childMemberSchema.parse(await $fetch(path(),{method:"PATCH",headers:await headers(),body:childUpdateSchema.parse(value)})),onSettled:refresh});
 const password:ReturnType<typeof useMutation<null,Error,PasswordReset>> = useMutation({mutationFn:async(value:PasswordReset):Promise<null>=>{await $fetch(`${path()}/password`,{method:"POST",headers:await headers(),body:passwordResetSchema.parse(value)});return null;},onSettled:refresh});
 const images:ReturnType<typeof useMutation<ChildMember,Error,ProfileImageAction>> = useMutation({mutationFn:async(value:ProfileImageAction):Promise<ChildMember>=>childMemberSchema.parse(await $fetch(`${path()}/images`,{method:"POST",headers:await headers(),body:profileImageActionSchema.parse(value)})),onSettled:refresh});
 return {save:save.mutateAsync,resetPassword:password.mutateAsync,changeImages:images.mutateAsync,isSaving:save.isPending,isResetting:password.isPending,isSavingImages:images.isPending};
}
