<script setup lang="ts">
	import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
	import ImageFileTarget from "./ImageFileTarget.vue";
	import ImageCropper from "./ImageCropper.vue";
	import ImageTransferProgress from "./ImageTransferProgress.vue";
	import { useImageSource } from "~/composables/useImageSource";
	import { useActionNotifications } from "~/composables/useActionNotifications";
	import { imageGeometry, type ImageGeometry } from "#shared/types/ProfileImages";
	import { requestFailureMessage } from "#shared/utils/RequestFailure";

	const props = withDefaults(defineProps<{
		identity: string;
		populated: boolean;
		saving: boolean;
		locked?: boolean;
		canEdit?: boolean;
		round?: boolean;
		label?: string;
		notify?: boolean;
		change: (action: ImageEditorAction) => Promise<unknown>;
	}>(), { canEdit: true, round: false, notify: true });
	const emit = defineEmits<{ choose: []; busy: [value: boolean] }>();
	type ImageEditorAction = { action: "upload"; png: string } | { action: "delete" };
	const { t } = useI18n();
	const { publish } = useActionNotifications();
	const source: ReturnType<typeof useImageSource> = useImageSource();
	const { image, loading } = source;
	const cropper: Ref<{ getPng: () => string } | null> = ref(null);
	const committing: Ref<boolean> = ref(false);
	const editing: Ref<boolean> = ref(false);
	const error: Ref<string | null> = ref(null);
	const disabled: ComputedRef<boolean> = computed((): boolean => props.locked || props.saving || loading.value || committing.value);

	/** Discard only the unsaved crop and release its decoded image. */
	function close(): void { editing.value = false; source.close(); error.value = null; }

	/** Persist through the caller's store or draft callback, retaining failed crops. */
	async function change(action: ImageEditorAction): Promise<boolean> {
		if (props.saving || loading.value || committing.value || !props.canEdit) return false;
		committing.value = true;
		error.value = null;
		try {
			await props.change(action);
			close();
			if (props.notify) publish({ name: "images.saved", severity: "success", message: t("profileImages.saved") });
			return true;
		} catch (failure: unknown) {
			error.value = requestFailureMessage(failure) ?? t("profileImages.saveError");
			return false;
		} finally { committing.value = false; }
	}

	/** Open the same crop dialog for picker and drop input on every page. */
	async function choose(file: File): Promise<void> {
		if (disabled.value || !props.canEdit) return;
		error.value = null;
		emit("choose");
		const decoded: HTMLImageElement | null = await source.choose(file);
		if (decoded && props.canEdit) editing.value = true;
		else if (source.error.value) error.value = t("profileImages.invalidFile");
	}

	/** Import a remote project thumbnail at contain size without opening a dialog. */
	async function importFile(file: File): Promise<boolean> {
		if (props.saving || loading.value || committing.value || !props.canEdit) return false;
		error.value = null;
		emit("choose");
		const decoded: HTMLImageElement | null = await source.choose(file);
		if (!decoded) { if (source.error.value) error.value = t("profileImages.invalidFile"); return false; }
		const geometry: ImageGeometry = imageGeometry(decoded.naturalWidth, decoded.naturalHeight, { zoom: 1, panX: 0, panY: 0 }, props.round);
		const canvas: HTMLCanvasElement = document.createElement("canvas");
		canvas.width = geometry.outputSize;
		canvas.height = geometry.outputSize;
		const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
		if (!context) { error.value = t("profileImages.invalidFile"); source.close(); return false; }
		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = "high";
		context.drawImage(decoded, geometry.x, geometry.y, geometry.width, geometry.height);
		return change({ action: "upload", png: canvas.toDataURL("image/png").split(",")[1] ?? "" });
	}

	/** Encode exactly the crop shown in the shared dialog. */
	async function save(): Promise<void> { if (cropper.value) await change({ action: "upload", png: cropper.value.getPng() }); }
	defineExpose({ importFile, close });
	watch((): string => props.identity, close);
	watch((): boolean => props.canEdit, (value: boolean): void => { if (!value) close(); });
	watch(disabled, (value: boolean): void => { emit("busy", value); });
</script>

<template>
	<div class="ImageEditor">
		<ImageFileTarget v-if="canEdit" :label="label ? `${t('profileImages.dropImage')} ${label}` : t('profileImages.dropImage')" :round="round" :disabled="disabled" @file="choose">
			<slot><UIcon name="i-lucide-image-plus" class="EmptyImageIcon" /></slot>
		</ImageFileTarget>
		<div v-else :class="['ImageFrame', { Round: round }]">
			<slot><UIcon name="i-lucide-image" class="EmptyImageIcon" /></slot>
		</div>
		<div v-if="canEdit" class="ImageControls">
			<p class="ImageHint">{{ t('profileImages.dropImage') }}</p>
			<UButton v-if="populated" type="button" icon="i-lucide-trash-2" color="error" variant="ghost" :aria-label="label ? `${t('profileImages.delete')} ${label}` : t('profileImages.delete')" :title="t('profileImages.delete')" :disabled="disabled" @click="change({ action: 'delete' })" />
		</div>
		<ImageTransferProgress :preparing="loading" :saving="saving || committing" />
		<UAlert v-if="error" color="error" :title="error" />
		<UModal :open="editing" :dismissible="!disabled" :title="t('profileImages.edit')" @update:open="(value: boolean): void => { if (!value && !disabled) close(); }">
			<template #body>
				<div class="CropEditor">
					<ImageCropper v-if="image" ref="cropper" :image="image" :round="round" :disabled="disabled" />
					<p>{{ t('profileImages.limit') }}</p>
					<ImageTransferProgress :preparing="loading" :saving="saving || committing" />
					<UAlert v-if="error" color="error" :title="error" />
					<div class="ImageActions">
						<UButton type="button" :loading="saving || committing" :disabled="disabled" @click="save">{{ t('profileImages.save') }}</UButton>
						<UButton type="button" variant="outline" :disabled="disabled" @click="close">{{ t('profile.cancel') }}</UButton>
					</div>
				</div>
			</template>
		</UModal>
	</div>
</template>

<style scoped lang="scss">
	.ImageEditor { display: grid; align-content: start; gap: calc(var(--spacing) * 2); width: 100%; min-width: 0; }
	.ImageFrame { width: 100%; aspect-ratio: 1; border: 1px solid var(--ui-border); display: grid; place-items: center; overflow: hidden; background: var(--ui-bg-accented); }
	.Round { border-radius: 50%; }
	.EmptyImageIcon { width: 2rem; height: 2rem; color: var(--ui-text-muted); }
	.ImageControls, .ImageActions { display: flex; align-items: center; gap: calc(var(--spacing) * 2); }
	.ImageHint { flex: 1; font-size: var(--text-sm); color: var(--ui-text-muted); }
	.ImageActions { flex-wrap: wrap; }
	.CropEditor { display: grid; gap: calc(var(--spacing) * 3); }
</style>
