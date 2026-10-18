<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { ProfileMode } from "#shared/types/MemberProfile";
	import type { AccountFields, GuardedUpdate } from "#shared/types/MemberMaintenance";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
	import MemberAccount from "~/components/Maintenance/MemberAccount.vue";
	import MemberSkills from "~/components/Maintenance/MemberSkills.vue";
	const props = defineProps<{ memberId: string; mode: ProfileMode }>();
	const emit = defineEmits<{ cancel: [] }>();
	const { t } = useI18n();
	const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
	const { data, isPending, isError, isSaving } = store;
	const member: ComputedRef<MemberModel | null> = computed((): MemberModel | null => store.membersById.value[props.memberId] ?? null);
	/** Save account properties through the existing mentor-authorized store. */
	async function saveAccount(body: GuardedUpdate<AccountFields>): Promise<MemberModel> {
		return store.saveAccount(props.memberId, body);
	}
</script>

<template>
	<section class="MentorProfileSections">
		<p v-if="isPending">{{ t('profile.loading') }}</p>
		<UAlert v-else-if="isError || !member" color="error" :title="t('profile.loadError')" />
		<template v-else-if="data && member">
			<MemberAccount :member="member" :mode="mode" :teams="data.teams" :saving="isSaving" :save="saveAccount" @cancel="emit('cancel')" />
			<MemberSkills v-if="member.isMentor" :memberId="member.id" :mode="mode" :categories="data.categories" :skills="data.skills" :saving="isSaving" :addSkill="store.addSkill" :removeSkill="store.removeSkill" />
			<UButton v-if="!member.isNinja" :to="`/mentor/maintenance/print?kind=member&memberId=${member.id}`" target="_blank" icon="i-lucide-printer" variant="outline">{{ t('printing.id') }}</UButton>
		</template>
	</section>
</template>

<style scoped lang="scss">
	.MentorProfileSections { display: grid; gap: calc(var(--spacing) * 6); }
	.MentorProfileSections > :deep(a) { justify-self: start; }
</style>
