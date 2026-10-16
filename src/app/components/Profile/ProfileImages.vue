<script setup lang="ts">
	import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
	import ImageEditor from "~/components/Images/ImageEditor.vue";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import type { ProfileImageAction, ProfileImageSlot } from "#shared/types/ProfileImages";
	import type { MemberImageSubject } from "#shared/types/MemberPresentation";

	const props = defineProps<{ member: MemberImageSubject; canEdit: boolean; saving: boolean; changeImages: (action: ProfileImageAction) => Promise<unknown> }>();
	type ImageChange = { action: "upload"; png: string } | { action: "delete" };
	type Slot = { key: ProfileImageSlot; populated: boolean; change: (action: ImageChange) => Promise<void> };
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);
	const busySlots: Ref<Record<ProfileImageSlot, boolean>> = ref({ photo: false, avatar: false });
	const busy: ComputedRef<boolean> = computed((): boolean => props.saving || busySlots.value.photo || busySlots.value.avatar);
	const slots: ComputedRef<Slot[]> = computed((): Slot[] => [
		{ key: "photo", populated: props.member.hasPhoto, change: async (action: ImageChange): Promise<void> => change({ ...action, slot: "photo" }) },
		{ key: "avatar", populated: props.member.hasAvatar, change: async (action: ImageChange): Promise<void> => change({ ...action, slot: "avatar" }) },
	]);

	/** Save a slot action through the profile store and refresh both image URLs. */
	async function change(action: ProfileImageAction): Promise<void> {
		if (!props.canEdit || props.saving) return;
		await props.changeImages(action);
		refreshImages();
	}

	/** Swap the two stored images while keeping profile feedback consistent. */
	async function swap(): Promise<void> {
		if (busy.value || !props.canEdit) return;
		try {
			await change({ action: "swap" });
			publish({ name: "profile.images.success", severity: "success", message: t("profileImages.saved") });
		} catch { publish({ name: "profile.images.error", severity: "error", message: t("profileImages.saveError") }); }
	}
	watch((): MemberImageSubject => props.member, (): void => { refreshImages(); });
</script>

<template>
	<section class="ProfileImages" :aria-label="t('profileImages.title')">
		<div v-for="slot in slots" :key="slot.key" class="ImageSlot">
			<h3>{{ t(`profileImages.${slot.key}`) }}</h3>
			<ImageEditor :identity="`${member.id}:${slot.key}`" :label="t(`profileImages.${slot.key}`)" :populated="slot.populated" :round="slot.key === 'photo'" :canEdit="canEdit" :saving="saving" :change="slot.change" @busy="busySlots[slot.key] = $event">
				<ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" />
				<UIcon v-else :name="canEdit ? 'i-lucide-image-plus' : 'i-lucide-image'" class="EmptyImageIcon" />
			</ImageEditor>
		</div>
		<div v-if="canEdit" class="SwapAction"><UButton type="button" icon="i-lucide-arrow-left-right" :aria-label="t('profileImages.swap')" :title="t('profileImages.swap')" variant="outline" :loading="saving" :disabled="busy || (!member.hasPhoto && !member.hasAvatar)" @click="swap" /></div>
	</section>
</template>

<style scoped lang="scss">
	.ProfileImages { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: calc(var(--spacing) * 2); width: min(100%, 28rem); align-items: start; }
	.ImageSlot { display: grid; gap: calc(var(--spacing) * 2); min-width: 0; }
	.ImageSlot:first-child { grid-column: 1; grid-row: 1; }
	.ImageSlot:nth-child(2) { grid-column: 3; grid-row: 1; }
	.ImageSlot h3 { text-align: center; }
	.SwapAction { grid-column: 2; grid-row: 1; align-self: center; }
	.EmptyImageIcon { width: 2rem; height: 2rem; color: var(--ui-text-muted); }
</style>
