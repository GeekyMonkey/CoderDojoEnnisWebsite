<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
    import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from "vue";
    import ImageCropper from "~/components/Images/ImageCropper.vue";
    import ImageFileTarget from "~/components/Images/ImageFileTarget.vue";
    import ImageTransferProgress from "~/components/Images/ImageTransferProgress.vue";
    import { useImageSource } from "~/composables/useImageSource";
    import { type ProfileImageAction, type ProfileImageSlot } from "#shared/types/ProfileImages";
    import type { MemberModel } from "#shared/types/models/MemberModel";
    const props = defineProps<{ member: MemberModel; canEdit: boolean; saving: boolean; changeImages: (action: ProfileImageAction) => Promise<MemberModel> }>();
    type Slot = { key: ProfileImageSlot; populated: boolean };
    const { t } = useI18n();
	const { publish } = useActionNotifications();
    const cropper: Ref<{ getPng: () => string } | null> = ref(null);
    const selected: Ref<ProfileImageSlot | null> = ref(null);
    const source: ReturnType<typeof useImageSource> = useImageSource();
    const { image, loading } = source;
    const error: Ref<string | null> = ref(null);
    const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);

    const slots: ComputedRef<Slot[]> = computed((): Slot[] => [{ key: "photo", populated: props.member.hasPhoto }, { key: "avatar", populated: props.member.hasAvatar }]);
    const open: ComputedRef<boolean> = computed((): boolean => selected.value !== null);

    /** Cancel the shared image decoder when the editor closes. */
    function close(): void { selected.value = null; source.close(); }
    /** Decode picker and drop input through the same validation flow. */
    async function choose(file: File, slot: ProfileImageSlot): Promise<void> {
        if (props.saving || loading.value || !props.canEdit) return;
        error.value = null;
        const decoded: HTMLImageElement | null = await source.choose(file);
        if (decoded && props.canEdit) selected.value = slot;
        else if (source.error.value) error.value = t("profileImages.invalidFile");
    }

    /** Persist an image action through the supplied profile store. */
    async function change(action: ProfileImageAction): Promise<void> {
        if (props.saving || loading.value || !props.canEdit) return;
        error.value = null;
        try {
            await props.changeImages(action);
            publish({ name: "profile.images.success", severity: "success", message: t("profileImages.saved") });
            refreshImages();
            close();
        } catch { publish({ name: "profile.images.error", severity: "error", message: t("profileImages.saveError") }); }
    }

    /** Encode the processed square as PNG so padding remains transparent. */
    async function save(): Promise<void> {
        if (!cropper.value || !selected.value) return;
        await change({ action: "upload", slot: selected.value, png: cropper.value.getPng() });
    }
    watch((): MemberModel => props.member, (): void => { refreshImages(); });
    watch((): string => props.member.id, close);
    watch((): boolean => props.canEdit, (canEdit: boolean): void => { if (!canEdit) { close(); error.value = null; } });
    onBeforeUnmount(close);
</script>

<template>
    <section class="ProfileImages" :aria-label="t('profileImages.title')">
        <div class="ImageSlots">
            <div v-for="slot in slots" :key="slot.key" class="ImageSlot">
                <h3>{{ t(`profileImages.${slot.key}`) }}</h3>
                <ImageFileTarget v-if="canEdit" class="ImageFrame" :class="{ Photo: slot.key === 'photo' }" :round="slot.key === 'photo'" :disabled="saving || loading" :label="`${t('profileImages.dropImage')} ${t(`profileImages.${slot.key}`)}`" @file="choose($event, slot.key)">
                    <ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" /><UIcon v-else name="i-lucide-image-plus" class="EmptyImageIcon" />
                </ImageFileTarget>
                <div v-else :class="['ImageFrame', { Photo: slot.key === 'photo' }]">
                    <ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" /><UIcon v-else name="i-lucide-image" class="EmptyImageIcon" />
                </div>
                <div v-if="canEdit" class="SlotActions">
                    <UButton v-if="canEdit && slot.populated" icon="i-lucide-trash-2" color="error" variant="ghost" :aria-label="`${t('profileImages.delete')} ${t(`profileImages.${slot.key}`)}`" :title="t('profileImages.delete')" :disabled="saving || loading" @click="change({ action: 'delete', slot: slot.key })" />
                </div>
            </div>
        <div v-if="canEdit" class="SwapAction"><UButton icon="i-lucide-arrow-left-right" :aria-label="t('profileImages.swap')" :title="t('profileImages.swap')" variant="outline" :loading="saving" :disabled="loading || (!member.hasPhoto && !member.hasAvatar)" @click="change({ action: 'swap' })" /></div>
        </div>
        <ImageTransferProgress :preparing="loading" :saving="saving" />
        <UAlert v-if="error" color="error" :title="error" />
        <UModal :open="open" :dismissible="!saving" :title="t('profileImages.edit')" @update:open="(value: boolean): void => { if (!value && !saving) close(); }">
            <template #body>
                <div class="CropEditor">
                    <ImageCropper v-if="image && selected" ref="cropper" :image="image" :round="selected === 'photo'" :disabled="saving" />
                    <p>{{ t('profileImages.limit') }}</p><ImageTransferProgress :preparing="false" :saving="saving" />
                    <UAlert v-if="error" color="error" :title="error" />
                    <div class="ImageActions"><UButton :loading="saving" @click="save">{{ t('profileImages.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="close">{{ t('profile.cancel') }}</UButton></div>
                </div>
            </template>
        </UModal>
    </section>
</template>

<style scoped lang="scss">
    .ProfileImages { display: grid; gap: calc(var(--spacing) * 2); width: min(100%, 28rem); }
    .ImageFrame.Editable { cursor: pointer; }
    .SlotActions { height: 2.75rem; }
    .ImageSlots { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: calc(var(--spacing) * 2); align-items: start; }
    .ImageSlot { display: contents; }
    .ImageSlot:first-child > * { grid-column: 1; }
    .ImageSlot:nth-child(2) > * { grid-column: 3; }
    .ImageSlot h3 { grid-row: 1; text-align: center; }
    .ImageSlot .ImageFrame { grid-row: 2; }
    .ImageSlot .SlotActions { grid-row: 3; }
    .SwapAction { grid-column: 2; grid-row: 2; align-self: center; }
    .CropEditor { display: grid; gap: calc(var(--spacing) * 3); }
    .ImageFrame { width: 100%; padding: 0; aspect-ratio: 1; border: 1px solid var(--ui-border); display: grid; place-items: center; overflow: hidden; }
    .ImageFrame { background-color: var(--ui-bg); background-image: conic-gradient(var(--ui-bg-accented) 25%, transparent 0 50%, var(--ui-bg-accented) 0 75%, transparent 0); background-size: 1rem 1rem; }
    .Photo { border-radius: 50%; overflow: hidden; }
    .ImageFileInput { display: none; }
    .ImageFrame:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 4px; }
    .ImageFrame:disabled { cursor: default; }
    .EmptyImageIcon { width: 2rem; height: 2rem; color: var(--ui-text-muted); }
    .SlotActions, .SwapAction { display: flex; justify-content: center; align-items: center; }
    .ImageActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
