<script setup lang="ts">
 import type {ChildMember} from "#shared/types/Parent";
 import {useParentChildActionsStore} from "~/stores/useParentChildActionsStore";
 import ChildAccountForm from "~/components/Profile/ChildAccountForm.vue";
 import ProfilePasswordDialog from "~/components/Profile/ProfilePasswordDialog.vue";
 const props = defineProps<{member:ChildMember}>();
 const store:ReturnType<typeof useParentChildActionsStore> = useParentChildActionsStore(():string=>props.member.id);
</script>
<template><ChildAccountForm :member="member" :saving="store.isSaving.value" :save="store.save" /><ProfilePasswordDialog :saving="store.isResetting.value" :resetPassword="store.resetPassword" /></template>
