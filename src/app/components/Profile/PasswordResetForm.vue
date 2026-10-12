<script setup lang="ts">
 import {reactive,onBeforeUnmount} from "vue";
 import {selectedPasswordResetFormSchema as passwordResetFormSchema,selectedPasswordResetSchema as passwordResetSchema,type SelectedPasswordReset as PasswordReset} from "#shared/types/MemberProfile";
 import {useActionNotifications} from "~/composables/useActionNotifications";
 import {requestFailureMessage} from "#shared/utils/RequestFailure";
 const props = withDefaults(defineProps<{saving:boolean;resetPassword:(value:PasswordReset)=>Promise<null>;cancelable?:boolean}>(),{cancelable:false});
 const emit = defineEmits<{cancel:[]}>();
 const {t} = useI18n();
 const {publish} = useActionNotifications();
 const state:{newPassword:string;confirmation:string} = reactive({newPassword:"",confirmation:""});
 /** Clear password inputs immediately after submitting or leaving the form. */
 function clear():void{state.newPassword="";state.confirmation="";}
 /** Discard credentials before notifying a caller to close the form. */
 function cancel():void{clear();emit("cancel");}
 /** Reset only the selected account through the supplied authorized store action. */
 async function submit():Promise<void>{
  if(props.saving)return;const parsed:ReturnType<typeof passwordResetFormSchema.safeParse> = passwordResetFormSchema.safeParse(state);if(!parsed.success)return;
  try{await props.resetPassword(passwordResetSchema.parse({newPassword:parsed.data.newPassword}));publish({name:"profile.password.reset",severity:"success",message:t("profile.passwordSaved")});}
  catch(error:unknown){publish({name:"profile.password.error",severity:"error",message:requestFailureMessage(error)??t("profile.passwordResetError")});}
  finally{clear();}
 }
 onBeforeUnmount(clear);
</script>
<template><UPageCard :title="t('profile.resetPassword')"><UForm :schema="passwordResetFormSchema" :state="state" class="PasswordResetForm" @submit="submit"><UFormField name="newPassword" :label="t('profile.newPassword')"><UInput v-model="state.newPassword" type="password" autocomplete="new-password" :disabled="saving" /></UFormField><UFormField name="confirmation" :label="t('profile.confirmPassword')"><UInput v-model="state.confirmation" type="password" autocomplete="new-password" :disabled="saving" /></UFormField><div class="ResetActions"><UButton type="submit" :loading="saving">{{t('profile.resetPassword')}}</UButton><UButton v-if="cancelable" variant="outline" :disabled="saving" @click="cancel">{{t('profile.cancel')}}</UButton></div></UForm></UPageCard></template>
<style scoped lang="scss">.PasswordResetForm{display:grid;gap:calc(var(--spacing)*4);}.ResetActions{display:flex;flex-wrap:wrap;gap:calc(var(--spacing)*3);}</style>
