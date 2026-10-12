<script setup lang="ts">
 import {ref,type Ref} from "vue";
 import ProfilePasswordResetForm from "~/components/Profile/PasswordResetForm.vue";
 import {passwordResetSchema,type PasswordReset} from "#shared/types/MemberMaintenance";
 import type {SelectedPasswordReset} from "#shared/types/MemberProfile";
 const props = defineProps<{saving:boolean;resetPassword:(body:PasswordReset)=>Promise<null>}>();
 const {t} = useI18n();
 const open:Ref<boolean> = ref(false);
 /** Adapt the validated shared form to the existing mentor API confirmation contract. */
 async function reset(value:SelectedPasswordReset):Promise<null>{await props.resetPassword(passwordResetSchema.parse({...value,confirmation:value.newPassword}));open.value=false;return null;}
 /** Close the independent password panel after the shared form clears its inputs. */
 function close():void{open.value=false;}
</script>
<template><UPageCard v-if="!open" :title="t('profile.resetPassword')"><UButton class="SectionEdit" variant="outline" @click="open=true">{{t('profile.resetPassword')}}</UButton></UPageCard><ProfilePasswordResetForm v-else :saving="saving" :resetPassword="reset" cancelable @cancel="close" /></template>
<style scoped lang="scss">.SectionEdit{width:fit-content;align-self:flex-start;justify-self:start;}</style>
