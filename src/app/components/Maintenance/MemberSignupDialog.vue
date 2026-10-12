<script setup lang="ts">
	import { ref, type Ref } from "vue";
	import { useMemberMaintenanceStore, type MemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
	const props = defineProps<{ sessionDate?: string | null }>();
	const { t } = useI18n();
	const store: MemberMaintenanceStore = useMemberMaintenanceStore();
	const open: Ref<boolean> = ref(false);
	/** Keep the form open while a member is being saved. */
	function setOpen(value: boolean): void { if (!store.isSaving.value) open.value = value; }
	/** Return to the unchanged attendance screen after creating a member. */
	function created(): void { open.value = false; }
</script>
<template>
	<UButton icon="i-lucide-user-plus" @click="setOpen(true)">{{ t('maintenance.signup') }}</UButton>
	<UModal :open="open" :dismissible="!store.isSaving.value" :title="t('maintenance.signup')" @update:open="setOpen">
	 <template #body>
	  <UAlert v-if="store.isError.value" color="error" :title="t('profile.loadError')" />
	  <p v-else-if="store.isPending.value">{{ t('profile.loading') }}</p>
	  <MemberSignup v-else-if="store.data.value" role="coder" :sessionDate="props.sessionDate" :teams="store.data.value.teams" :saving="store.isSaving.value" :create="store.create" @created="created" @cancel="setOpen(false)" />
	 </template>
	</UModal>
</template>
