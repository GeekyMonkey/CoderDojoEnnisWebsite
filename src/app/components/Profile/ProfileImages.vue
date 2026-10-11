<script setup lang="ts">
    import { computed, onBeforeUnmount, ref, watch, type ComputedRef, type Ref } from "vue";
    import { MAX_SOURCE_BYTES, type ProfileImageAction, type ProfileImageSlot } from "#shared/types/ProfileImages";
    import type { MemberModel } from "#shared/types/models/MemberModel";
    const props = defineProps<{ member: MemberModel; canEdit: boolean; saving: boolean; changeImages: (action: ProfileImageAction) => Promise<MemberModel> }>();
    type Slot = { key: ProfileImageSlot; populated: boolean };
    const { t } = useI18n();
    const cropper: Ref<{ getPng: () => string } | null> = ref(null);
    const selected: Ref<ProfileImageSlot | null> = ref(null);
    const image: Ref<HTMLImageElement | null> = ref(null);
    const error: Ref<string | null> = ref(null);
    const notice: Ref<string | null> = ref(null);
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
        if (!file || props.saving || !props.canEdit) return;
        error.value = null;
        notice.value = null;
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
        if (props.saving || !props.canEdit) return;
        error.value = null; notice.value = null;
        try {
            await props.changeImages(action);
            refreshImages();
            notice.value = t("profileImages.saved");
            close();
        } catch { error.value = t("profileImages.saveError"); }
    }

    /** Encode the processed square as PNG so padding remains transparent. */
    async function save(): Promise<void> {
        if (!cropper.value || !selected.value) return;
        await change({ action: "upload", slot: selected.value, png: cropper.value.getPng() });
    }
    watch((): MemberModel => props.member, (): void => { refreshImages(); });
    watch((): string => props.member.id, close);
    onBeforeUnmount(close);
</script>

<template>
    <UPageCard :title="t('profileImages.title')">
        <div class="ImageSlots">
            <div v-for="slot in slots" :key="slot.key" class="ImageSlot">
                <h3>{{ t(`profileImages.${slot.key}`) }}</h3>
                <div :class="['ImageFrame', { Photo: slot.key === 'photo' }]">
                    <ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" />
                    <span v-else>{{ t('profileImages.empty') }}</span>
                </div>
                <template v-if="canEdit">
                    <label class="UploadLabel">{{ t('profileImages.upload') }}
                        <input type="file" accept="image/jpeg,image/png,image/webp" :disabled="saving || loading" :aria-label="`${t('profileImages.upload')} ${t(`profileImages.${slot.key}`)}`" @change="choose($event, slot.key)" />
                    </label>
                    <UButton v-if="slot.populated" color="error" variant="outline" :disabled="saving || loading" @click="change({ action: 'delete', slot: slot.key })">{{ t('profileImages.delete') }}</UButton>
                </template>
            </div>
        </div>
        <UButton v-if="canEdit" variant="outline" :loading="saving" :disabled="loading || (!member.hasPhoto && !member.hasAvatar)" @click="change({ action: 'swap' })">{{ t('profileImages.swap') }}</UButton>
        <UAlert v-if="error" color="error" :title="error" />
        <UAlert v-if="notice" color="success" :title="notice" />
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
    </UPageCard>
</template>

<style scoped lang="scss">
    .ImageSlots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(var(--spacing) * 4); }
    .ImageSlot, .CropEditor { display: grid; gap: calc(var(--spacing) * 3); }
    .ImageFrame { width: min(100%, 12rem); aspect-ratio: 1; border: 1px solid var(--ui-border); display: grid; place-items: center; overflow: hidden; }
    .ImageFrame { background-color: var(--ui-bg); background-image: conic-gradient(var(--ui-bg-accented) 25%, transparent 0 50%, var(--ui-bg-accented) 0 75%, transparent 0); background-size: 1rem 1rem; }
    .Photo { border-radius: 50%; overflow: hidden; }
    .UploadLabel { display: grid; gap: var(--spacing); }
    input { max-width: 100%; }
    .ImageActions { display: flex; gap: calc(var(--spacing) * 3); }
</style>
