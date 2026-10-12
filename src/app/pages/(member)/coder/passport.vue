<script setup lang="ts">
 import { ref,type Ref } from "vue";
 import { useCoderContextStore } from "~/stores/useCoderContextStore";
 import MemberIdCard from "~/components/Printing/MemberIdCard.vue";
 definePageMeta({layout:false});
 const {t} = useI18n();
 const {data,isPending,isError} = useCoderContextStore();
 const ready:Ref<boolean> = ref(false);
 /** Open the print dialog only after the own-member QR and award data are ready. */
 function print():void { if (ready.value && !isPending.value && !isError.value) window.print(); }
</script>
<template><main class="Passport"><div class="Toolbar"><UButton to="/coder/profile" variant="outline">{{ t('profile.title') }}</UButton><UButton :disabled="!ready || isPending || isError" icon="i-lucide-printer" @click="print">{{ t('teams.print') }}</UButton></div><p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><MemberIdCard v-else-if="data" :member="data.member" :team="data.team" :skillNames="[]" own @ready="(_id:string,value:boolean):void=>{ready=value;}" /></main></template>
<style scoped lang="scss">.Passport { padding:calc(var(--spacing)*4); } .Toolbar { display:flex; flex-wrap:wrap; gap:calc(var(--spacing)*3); margin-bottom:calc(var(--spacing)*5); } @media print { .Passport { padding:0; } .Toolbar { display:none; } }</style>
