<script setup lang="ts">
 import {computed,ref,watch,type ComputedRef,type Ref} from "vue";
 import {profileIdentitySchema} from "#shared/types/MemberProfile";
 import {useParentChildStore} from "~/stores/useParentStore";
 import MemberIdCard from "~/components/Printing/MemberIdCard.vue";
 definePageMeta({layout:false});
 const route:ReturnType<typeof useRoute> = useRoute();
 const {t} = useI18n();
 const id:ComputedRef<string> = computed(():string=>{const params:Record<string,string|string[]> = route.params;return typeof params.memberId==="string"?params.memberId:"";});
 const valid:ComputedRef<boolean> = computed(():boolean=>profileIdentitySchema.safeParse(id.value).success);
 const {data,isPending,isError} = useParentChildStore(id);
 const ready:Ref<boolean> = ref(false);
 /** Print only a freshly authorized child card after QR and award data are ready. */
 function print():void {if(ready.value && data.value && !isError.value && !isPending.value)window.print();}
 watch(id,():void=>{ready.value=false;});
</script>
<template><main class="Passport"><div class="Toolbar"><UButton :to="`/parent/kids/${id}`" variant="outline">{{t('parent.summary')}}</UButton><UButton :disabled="!ready || isPending || isError || !data" icon="i-lucide-printer" @click="print">{{t('teams.print')}}</UButton></div><UAlert v-if="!valid || isError" color="error" :title="t('profile.loadError')" /><p v-else-if="isPending">{{t('profile.loading')}}</p><MemberIdCard v-else-if="data" :key="id" :member="data.member" :team="data.team" :skillNames="[]" parent @ready="(_id:string,value:boolean):void=>{ready=value;}" /></main></template>
<style scoped lang="scss">.Passport{padding:calc(var(--spacing)*4);}.Toolbar{display:flex;flex-wrap:wrap;gap:calc(var(--spacing)*3);margin-bottom:calc(var(--spacing)*5);}@media print{.Passport{padding:0;}.Toolbar{display:none;}}</style>
