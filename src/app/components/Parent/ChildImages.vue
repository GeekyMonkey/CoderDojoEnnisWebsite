<script setup lang="ts">
 import type {ChildMember} from "#shared/types/Parent";
 import {useParentChildActionsStore} from "~/stores/useParentChildActionsStore";
 import ProfileImages from "~/components/Profile/ProfileImages.vue";
 const props = defineProps<{member:ChildMember}>();
 const store:ReturnType<typeof useParentChildActionsStore> = useParentChildActionsStore(():string=>props.member.id);
</script>
<template><ProfileImages :member="member" canEdit :saving="store.isSavingImages.value" :changeImages="store.changeImages" /></template>
