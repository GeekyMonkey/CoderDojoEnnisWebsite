<script setup lang="ts">
 import {computed,watch,type ComputedRef} from "vue";
 import type {ProfileMode} from "#shared/types/MemberProfile";
 import {useSectionDraft} from "~/composables/useSectionDraft";
 import {useActionNotifications} from "~/composables/useActionNotifications";
 import {requestFailureMessage} from "#shared/utils/RequestFailure";
 import {childFieldsSchema,childFormSchema,childSnapshot,type ChildMember,type ChildUpdate} from "#shared/types/Parent";
 const props = withDefaults(defineProps<{member:ChildMember;mode?:ProfileMode;saving:boolean;save:(value:ChildUpdate)=>Promise<unknown>}>(),{mode:"edit"});
 const emit = defineEmits<{cancel:[]}>();
 const {t} = useI18n();
 const {publish} = useActionNotifications();
 const {fields,baseline,dirty,remoteChanged,reset} = useSectionDraft(():ChildMember=>props.member,childSnapshot);
 const editing:ComputedRef<boolean> = computed(():boolean=>props.mode==="edit");
 const HANDLES:("githubLogin"|"scratchName"|"xboxGamertag")[] = ["githubLogin","scratchName","xboxGamertag"];
 /** Validate the narrow account fields and keep the original snapshot until a successful save. */
 async function submit():Promise<void>{
  if(!editing.value || props.saving || remoteChanged.value)return;
  try{await props.save({fields:childFieldsSchema.parse(fields),expected:baseline.value});reset();publish({name:"parent.child.saved",severity:"success",message:t("actionNotifications.saved")});}
  catch(error:unknown){publish({name:"parent.child.error",severity:"error",message:requestFailureMessage(error)??t("profile.saveError")});}
 }
 /** Discard the draft and let the containing profile return to display mode. */
 function cancel():void{reset();emit("cancel");}
 /** Normalize a cleared birth year to null without submitting NaN. */
 function birthYear(value:string|number):void{fields.birthYear=String(value).trim()===""?null:Number(value);}
 watch(():ProfileMode=>props.mode,():void=>{reset();});
</script>
<template><UPageCard :title="t('parent.account')"><dl v-if="!editing" class="ChildAccountDisplay"><div><dt>{{t('maintenance.birthYear')}}</dt><dd>{{member.birthYear ?? '—'}}</dd></div><div><dt>{{t('profile.login')}}</dt><dd>{{member.login ?? '—'}}</dd></div><div v-for="key in HANDLES" :key="key"><dt>{{t(`profile.${key}`)}}</dt><dd>{{member[key] ?? '—'}}</dd></div></dl><UForm v-else :schema="childFormSchema" :state="fields" class="ChildAccountForm" @submit="submit"><UFormField name="birthYear" :label="t('maintenance.birthYear')"><UInput :modelValue="fields.birthYear === null ? '' : String(fields.birthYear)" type="number" :disabled="saving" @update:modelValue="birthYear" /></UFormField><UFormField name="login" :label="t('profile.login')"><UInput :modelValue="fields.login ?? ''" autocomplete="username" :disabled="saving" @update:modelValue="(value:string|number):void=>{fields.login=String(value);}" /></UFormField><UFormField v-for="key in HANDLES" :key="key" :name="key" :label="t(`profile.${key}`)"><UInput :modelValue="fields[key] ?? ''" :disabled="saving" @update:modelValue="(value:string|number):void=>{fields[key]=String(value);}" /></UFormField><UAlert v-if="remoteChanged" color="warning" :title="t('profile.remoteChanged')" /><div class="Actions"><UButton type="submit" :loading="saving" :disabled="!dirty || remoteChanged">{{t('profile.save')}}</UButton><UButton variant="outline" :disabled="saving" @click="cancel">{{t(remoteChanged?'profile.reload':'profile.cancel')}}</UButton></div></UForm></UPageCard></template>
<style scoped lang="scss">.ChildAccountDisplay{display:grid;gap:calc(var(--spacing)*3);}.ChildAccountDisplay dt{font-weight:600;}.ChildAccountDisplay dd{margin:0;overflow-wrap:anywhere;}.ChildAccountForm{display:grid;gap:calc(var(--spacing)*4);}.Actions{display:flex;flex-wrap:wrap;gap:calc(var(--spacing)*3);}.ChildAccountForm :deep(input){max-width:100%;}</style>
