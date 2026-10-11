<script setup lang="ts">
	import { useActionNotifications } from "~/composables/useActionNotifications";
    import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from "vue";
    import { MAX_SOURCE_BYTES, type ProfileImageAction, type ProfileImageSlot } from "#shared/types/ProfileImages";
    import type { MemberModel } from "#shared/types/models/MemberModel";
    const props = defineProps<{ member: MemberModel; canEdit: boolean; saving: boolean; changeImages: (action: ProfileImageAction) => Promise<MemberModel> }>();
    type Slot = { key: ProfileImageSlot; populated: boolean };
    const { t } = useI18n();
	const { publish } = useActionNotifications();
    const cropper: Ref<{ getPng: () => string } | null> = ref(null);
    const selected: Ref<ProfileImageSlot | null> = ref(null);
    const image: Ref<HTMLImageElement | null> = ref(null);
    const error: Ref<string | null> = ref(null);
    const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);
    const loading: Ref<boolean> = ref(false);
    let sourceUrl: string | null = null;
    let loadSequence: number = 0;
    const slots: ComputedRef<Slot[]> = computed((): Slot[] => [{ key: "photo", populated: props.member.hasPhoto }, { key: "avatar", populated: props.member.hasAvatar }]);
    const open: ComputedRef<boolean> = computed((): boolean => selected.value !== null);

    /** Release temporary image data when the editor is closed. */
    function close(): void {
        loadSequence++;
        selected.value = null;
        image.value = null;
        loading.value = false;
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
        sourceUrl = null;
    }

    /** Decode an image locally before presenting the crop editor. */
    async function choose(event: Event, slot: ProfileImageSlot): Promise<void> {
        const input: HTMLInputElement = event.target as HTMLInputElement;
        const file: File | undefined = input.files?.[0];
        input.value = "";
        if (!file || props.saving || loading.value || !props.canEdit) return;
        error.value = null;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_SOURCE_BYTES) { error.value = t("profileImages.invalidFile"); return; }
        close();
        const sequence: number = ++loadSequence;
        loading.value = true;
        sourceUrl = URL.createObjectURL(file);
        const decoded: HTMLImageElement = new Image();
        decoded.src = sourceUrl;
        try {
            await decoded.decode();
            if (sequence !== loadSequence) return;
            if (!decoded.naturalWidth || !decoded.naturalHeight || decoded.naturalWidth * decoded.naturalHeight > 50_000_000) throw new Error("Image too large");
            image.value = decoded;
            selected.value = slot;
        } catch { if (sequence === loadSequence) { close(); error.value = t("profileImages.invalidFile"); } }
        finally { if (sequence === loadSequence) loading.value = false; }
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
                <component :is="canEdit ? 'button' : 'div'" :type="canEdit ? 'button' : undefined" :class="['ImageFrame', { Photo: slot.key === 'photo', Editable: canEdit }]" :disabled="canEdit ? saving || loading : undefined" :aria-label="canEdit ? `${t('profileImages.upload')} ${t(`profileImages.${slot.key}`)}` : t(`profileImages.${slot.key}`)" @click="canEdit && ($refs[slot.key + 'Input'] as HTMLInputElement[])?.[0]?.click()">
                    <ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" />
                    <UIcon v-else :name="canEdit ? 'i-lucide-image-plus' : 'i-lucide-image'" class="EmptyImageIcon" />
                </component>
                <input v-if="canEdit" :ref="slot.key + 'Input'" class="ImageFileInput" type="file" accept="image/jpeg,image/png,image/webp" tabindex="-1" :disabled="saving || loading" :aria-label="`${t('profileImages.upload')} ${t(`profileImages.${slot.key}`)}`" @change="choose($event, slot.key)" />
                <div v-if="canEdit" class="SlotActions">
                    <UButton v-if="canEdit && slot.populated" icon="i-lucide-trash-2" color="error" variant="ghost" :aria-label="`${t('profileImages.delete')} ${t(`profileImages.${slot.key}`)}`" :title="t('profileImages.delete')" :disabled="saving || loading" @click="change({ action: 'delete', slot: slot.key })" />
                </div>
            </div>
        </div>
        <div v-if="canEdit" class="SwapAction"><UButton icon="i-lucide-arrow-left-right" :aria-label="t('profileImages.swap')" :title="t('profileImages.swap')" variant="outline" :loading="saving" :disabled="loading || (!member.hasPhoto && !member.hasAvatar)" @click="change({ action: 'swap' })" /></div>
        <UAlert v-if="error" color="error" :title="error" />
        <UModal :open="open" :dismissible="!saving" :title="t('profileImages.edit')" @update:open="(value: boolean): void => { if (!value && !saving) close(); }">
            <template #body>
                <div class="CropEditor">
                    <ProfileImageCropper v-if="image && selected" ref="cropper" :image="image" :slot="selected" :disabled="saving" />
                    <p>{{ t('profileImages.limit') }}</p>
                    <UAlert v-if="error" color="error" :title="error" />
                    <div class="ImageActions"><UButton :loading="saving" @click="save">{{ t('profile.save') }}</UButton><UButton variant="outline" :disabled="saving" @click="close">{{ t('profile.cancel') }}</UButton></div>
                </div>
            </template>
        </UModal>
    </section>
</template>

<style scoped lang="scss">
    .ProfileImages { display: grid; gap: calc(var(--spacing) * 2); width: min(100%, 26rem); }
    .ImageFrame.Editable { cursor: pointer; }
    .SlotActions { height: 2.75rem; }
    .ImageSlots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(var(--spacing) * 4); }
    .ImageSlot { display: grid; align-content: start; justify-items: center; gap: calc(var(--spacing) * 3); min-width: 0; }
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
