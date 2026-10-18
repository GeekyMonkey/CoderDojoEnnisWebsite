<script setup lang="ts">
	import { computed, type ComputedRef } from "vue";
	import type { MemberModel } from "#shared/types/models/MemberModel";
	import { profileFieldsForRoles, type ProfileField } from "./profileFields";
	type DisplaySubject = Pick<MemberModel, "id" | "nameFirst" | "nameLast" | "birthYear" | "githubLogin" | "scratchName" | "xboxGamertag" | "isNinja" | "isParent" | "isMentor"> & Partial<Pick<MemberModel, "login" | "email" | "phone">>;
	const props = defineProps<{ member: DisplaySubject }>();
	type DisplayField = ProfileField & { value: string };
	const { t } = useI18n();
	const fields: ComputedRef<DisplayField[]> = computed((): DisplayField[] => profileFieldsForRoles(props.member)
		.filter((field: ProfileField): boolean => field.key in props.member)
		.map((field: ProfileField): DisplayField => ({ ...field, value: props.member[field.key] ?? "—" })));
</script>

<template>
	<div class="ProfileFieldsDisplay">
		<MemberRoles :modelValue="member" mode="view" />
		<p v-if="'login' in member">{{ t('profile.login') }}: {{ member.login ?? '—' }}</p>
		<p v-if="member.isNinja">{{ t('maintenance.birthYear') }}: {{ member.birthYear ?? '—' }}</p>
		<ProfileExternalLinks v-if="member.isNinja || member.isMentor" :member="member" />
		<dl class="ProfileFields">
			<div v-for="field in fields" :key="field.key"><dt>{{ t(`profile.${field.key}`) }}</dt><dd>{{ field.value }}</dd></div>
		</dl>
	</div>
</template>

<style scoped lang="scss">
	.ProfileFieldsDisplay { display: grid; gap: calc(var(--spacing) * 4); }
	.ProfileFields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: calc(var(--spacing) * 4); }
	.ProfileFields dt { font-weight: 600; }
	.ProfileFields dd { margin: 0; overflow-wrap: anywhere; }
</style>
