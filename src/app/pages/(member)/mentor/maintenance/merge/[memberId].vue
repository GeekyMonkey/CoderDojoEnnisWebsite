<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import MemberMergeForm from "~/components/Maintenance/MemberMergeForm.vue";
import { useMemberMaintenanceStore } from "~/stores/useMemberMaintenanceStore";
import { useMyProfileStore } from "~/stores/useMyProfileStore";
import { profileIdentitySchema } from "#shared/types/MemberProfile";
import type { MemberModel } from "#shared/types/models/MemberModel";
const route: ReturnType<typeof useRoute> = useRoute();
const myProfile: ReturnType<typeof useMyProfileStore> = useMyProfileStore();
const { t } = useI18n();
const store: ReturnType<typeof useMemberMaintenanceStore> = useMemberMaintenanceStore();
const id: ComputedRef<string | null> = computed((): string | null => { const parsed: ReturnType<typeof profileIdentitySchema.safeParse> = profileIdentitySchema.safeParse(route.params.memberId); return parsed.success ? parsed.data : null; });
const member: ComputedRef<MemberModel | null> = computed((): MemberModel | null => store.membersById.value[id.value ?? ""] ?? null);
const actorId: ComputedRef<string> = computed((): string => myProfile.profile.value?.id ?? "");
/** Return to the surviving account after a successful merge. */
async function merged(value: MemberModel): Promise<void> { await navigateTo(`/mentor/member/${value.id}`); }
</script>
<template><UDashboardPanel id="member-merge"><template #header><DashboardHeading :pageTitle="t('accountMerge.title')" :breadcrumbLabel="member ? `${member.nameFirst} ${member.nameLast}` : t('nav.Members')" :breadcrumbTo="member ? `/mentor/member/${member.id}` : '/mentor/members'" /></template><template #body><main class="MergePage"><p v-if="store.isPending.value">{{ t('profile.loading') }}</p><UAlert v-else-if="store.isError.value || !member" color="error" :title="t('profile.loadError')" /><MemberMergeForm v-else-if="member && store.data.value" :key="member.id" :member="member" :members="store.data.value.members" :teams="store.data.value.teams" :actorId="actorId" :saving="store.isSaving.value" :merge="store.merge" @merged="merged" /></main></template></UDashboardPanel></template>
<style scoped lang="scss">.MergePage { padding: calc(var(--spacing) * 4); max-width: 60rem; }</style>
