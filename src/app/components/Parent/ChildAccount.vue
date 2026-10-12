<script setup lang="ts">
 import type {ChildMember} from "#shared/types/Parent";
 import {useParentChildActionsStore} from "~/stores/useParentChildActionsStore";
 import ChildAccountForm from "~/components/Profile/ChildAccountForm.vue";
 import PasswordResetForm from "~/components/Profile/PasswordResetForm.vue";
 const props = defineProps<{member:ChildMember}>();
 const store:ReturnType<typeof useParentChildActionsStore> = useParentChildActionsStore(():string=>props.member.id);
</script>
<template><ChildAccountForm :member="member" :saving="store.isSaving.value" :save="store.save" /><PasswordResetForm :saving="store.isResetting.value" :resetPassword="store.resetPassword" /></template>
