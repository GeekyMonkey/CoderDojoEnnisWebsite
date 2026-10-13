<script setup lang="ts">
 import {useParentChildrenStore} from "~/stores/useParentStore";
 import MemberPhoto from "~/components/Members/MemberPhoto.vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const {t} = useI18n();
 const {data,isPending,isError} = useParentChildrenStore();
</script>
<template><section class="ChildrenList"><p v-if="isPending">{{t('profile.loading')}}</p><UAlert v-else-if="isError" color="error" :title="t('profile.loadError')" /><p v-else-if="!data?.length">{{t('parent.noChildren')}}</p><ul v-else><li v-for="child in data" :key="child.member.id"><NuxtLink :to="`/parent/kids/${child.member.id}`"><MemberPhoto :member="child.member" size="md" /><div class="ChildIdentity"><strong>{{child.member.nameFirst}} {{child.member.nameLast}}</strong><BeltColor :belt="child.currentBelt ?? 'noob'" mode="small" /><span>{{t('maintenance.sessionsCount',{count:child.attendanceCount})}}</span></div></NuxtLink></li></ul></section></template>
<style scoped lang="scss">.ChildrenList ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:calc(var(--spacing)*4);list-style:none;padding:0;}li a{display:flex;align-items:center;gap:calc(var(--spacing)*3);padding:calc(var(--spacing)*4);border:1px solid var(--ui-border);border-radius:var(--radius-lg);}.ChildIdentity{display:grid;gap:calc(var(--spacing)*2);min-width:0;overflow-wrap:anywhere;}</style>
