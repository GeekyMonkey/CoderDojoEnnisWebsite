<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 import ImageFileTarget from "./ImageFileTarget.vue";
 import ImageTransferProgress from "./ImageTransferProgress.vue";
 import ImageCropper from "./ImageCropper.vue";
 import { useImageSource } from "~/composables/useImageSource";
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import type { EntityImageAction } from "#shared/types/ImageUpload";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 type ImageChange = { action: "upload"; png: string } | { action: "delete" };
 const props = defineProps<{ identity: string; revision: string | null; populated: boolean; saving: boolean; change: (action: EntityImageAction) => Promise<unknown> }>();
 const { t } = useI18n();
 const { publish } = useActionNotifications();
 const source: ReturnType<typeof useImageSource> = useImageSource();
 const { image, loading, error } = source;
 const baseline: Ref<string | null> = ref(null);
 const cropper: Ref<{ getPng: () => string } | null> = ref(null);
 const open: ComputedRef<boolean> = computed((): boolean => image.value !== null);
 /** Decode a selected or dropped image before opening the shared crop tool. */
 async function choose(file: File): Promise<void> { if (!props.saving && !loading.value) { baseline.value = props.revision; await source.choose(file); } }
 /** Send a processed image or removal through the entity's store callback. */
 async function change(action: ImageChange): Promise<void> {
  if (props.saving || loading.value) return;
  try { await props.change({ ...action, expectedRevision: action.action === "upload" ? baseline.value : props.revision }); source.close(); publish({ name: "images.entity.success", severity: "success", message: t("profileImages.saved") }); }
  catch (failure: unknown) { publish({ name: "images.entity.error", severity: "error", message: requestFailureMessage(failure) ?? t("profileImages.saveError") }); }
 }
 /** Encode the crop without exposing storage details to the component. */
 async function save(): Promise<void> { if (cropper.value) await change({ action: "upload", png: cropper.value.getPng() }); }
 watch((): string => props.identity, source.close);
</script>
<template>
	<section class="EntityImageEditor">
	<ImageFileTarget :label="t('profileImages.dropImage')" :disabled="saving || loading" @file="choose">
	<slot />
	</ImageFileTarget>
	<p>{{ t('profileImages.dropImage') }}</p>
	<UButton v-if="populated" color="error" variant="outline" :disabled="saving || loading" @click="change({ action: 'delete' })">{{ t('profileImages.delete') }}</UButton>
	<ImageTransferProgress :preparing="loading" :saving="saving" />
	<UAlert v-if="error" color="error" :title="t('profileImages.invalidFile')" />
	<UModal :open="open" :dismissible="!saving" :title="t('profileImages.edit')" @update:open="(value: boolean): void => { if (!value && !saving) source.close(); }">
	<template #body>
	<ImageCropper v-if="image" ref="cropper" :image="image" :round="false" :disabled="saving" />
	<p>{{ t('profileImages.limit') }}</p>
	<ImageTransferProgress :preparing="false" :saving="saving" />
	<div class="ImageActions">
	<UButton :loading="saving" @click="save">{{ t('profileImages.save') }}</UButton>
	<UButton variant="outline" :disabled="saving" @click="source.close">{{ t('profile.cancel') }}</UButton>
	</div>
	</template></UModal></section></template>
<style scoped lang="scss">.EntityImageEditor { width: min(100%, 16rem); display: grid; gap: calc(var(--spacing) * 3); } .ImageActions { display: flex; gap: calc(var(--spacing) * 3); }</style>
