<script setup lang="ts">
 import type {ParentContact} from "#shared/types/Parent";
 const props = defineProps<{parents:ParentContact[]}>();
 const {t} = useI18n();
</script>
<template><UPageCard :title="t('parent.parents')"><ul class="ParentContacts"><li v-for="parent in parents" :key="parent.id"><strong>{{parent.nameFirst}} {{parent.nameLast}}</strong><span>{{t('profile.email')}}: {{parent.email || '—'}}</span><span>{{t('profile.phone')}}: {{parent.phone || '—'}}</span></li></ul></UPageCard></template>
<style scoped lang="scss">.ParentContacts,.ParentContacts li{display:grid;gap:calc(var(--spacing)*3);list-style:none;padding:0;overflow-wrap:anywhere;}</style>
