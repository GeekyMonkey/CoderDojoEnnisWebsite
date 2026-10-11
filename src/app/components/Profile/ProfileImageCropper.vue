<script setup lang="ts">
    import { ref, watch, onBeforeUnmount, type Ref } from "vue";
    import { imageGeometry, clampImageTransform, zoomImageTransform, type ProfileImageSlot, type ImageGeometry, type ImageTransform, type ImagePoint } from "#shared/types/ProfileImages";
    const props = defineProps<{ image: HTMLImageElement; slot: ProfileImageSlot; disabled: boolean }>();
    type Metrics = { center: ImagePoint; distance: number; count: number };
    type Gesture = Metrics & { initial: ImageTransform };
    const { t } = useI18n();
    const instructionsId: string = useId();
    const CENTER: ImagePoint = { x: 0.5, y: 0.5 };
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);
    const dragging: Ref<boolean> = ref(false);
    const transform: Ref<ImageTransform> = ref({ zoom: 1, panX: 0, panY: 0 });
    const pointers: Map<number, ImagePoint> = new Map<number, ImagePoint>();
    let gesture: Gesture | null = null;
    let captureTarget: HTMLElement | null = null;

    /** Release pointers when cancelling gestures or closing the editor. */
    function resetGestures(): void {
        for (const id of pointers.keys()) if (captureTarget?.hasPointerCapture(id)) captureTarget.releasePointerCapture(id);
        pointers.clear(); gesture = null; captureTarget = null; dragging.value = false;
    }

    /** Convert screen coordinates into normalized crop-frame coordinates. */
    function framePoint(event: PointerEvent | WheelEvent): ImagePoint {
        const rectangle: DOMRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        return { x: (event.clientX - rectangle.left) / rectangle.width, y: (event.clientY - rectangle.top) / rectangle.height };
    }

    /** Measure one-finger movement or the midpoint and separation of two fingers. */
    function pointerMetrics(): Metrics | null {
        const points: ImagePoint[] = Array.from(pointers.values());
        const first: ImagePoint | undefined = points[0];
        const second: ImagePoint | undefined = points[1];
        if (!first) return null;
        if (!second) return { center: first, distance: 0, count: 1 };
        return { center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }, distance: Math.hypot(first.x - second.x, first.y - second.y), count: 2 };
    }

    /** Rebase when fingers join or leave so the image position remains continuous. */
    function beginGesture(): void {
        const metrics: Metrics | null = pointerMetrics();
        gesture = metrics ? { ...metrics, initial: { ...transform.value } } : null;
        dragging.value = metrics !== null;
    }

    /** Apply pan and zoom limits without enforcing a separate fit mode. */
    function updateTransform(value: ImageTransform): void {
        if (props.disabled) return;
        transform.value = clampImageTransform(props.image.naturalWidth, props.image.naturalHeight, value, props.slot === "photo");
    }

    /** Capture primary mouse or touch pointers for direct image manipulation. */
    function pointerDown(event: PointerEvent): void {
        if (props.disabled || pointers.size >= 2 || (event.pointerType === "mouse" && event.button !== 0)) return;
        event.preventDefault();
        captureTarget = event.currentTarget as HTMLElement;
        captureTarget.focus({ preventScroll: true });
        captureTarget.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, framePoint(event));
        beginGesture();
    }

    /** Combine dragging with pinch scale and simultaneous midpoint movement. */
    function pointerMove(event: PointerEvent): void {
        if (!pointers.has(event.pointerId) || !gesture || props.disabled) return;
        pointers.set(event.pointerId, framePoint(event));
        const metrics: Metrics | null = pointerMetrics();
        if (!metrics) return;
        const zoom: number = gesture.count === 2 && gesture.distance > 0.001 ? gesture.initial.zoom * metrics.distance / gesture.distance : gesture.initial.zoom;
        updateTransform(zoomImageTransform(gesture.initial, zoom, gesture.center, metrics.center));
    }

    /** Resume one-finger dragging after a pinch or clear cancelled input. */
    function pointerEnd(event: PointerEvent): void {
        if (!pointers.delete(event.pointerId)) return;
        const element: HTMLElement = event.currentTarget as HTMLElement;
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        beginGesture();
    }

    /** Zoom around the mouse cursor using wheel pixels, lines, or pages. */
    function wheel(event: WheelEvent): void {
        if (props.disabled || pointers.size > 0) return;
        const unit: number = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? (event.currentTarget as HTMLElement).clientHeight : 1;
        const factor: number = Math.exp(-Math.max(-500, Math.min(500, event.deltaY * unit)) * 0.002);
        updateTransform(zoomImageTransform(transform.value, transform.value.zoom * factor, framePoint(event)));
    }

    /** Provide an accessible alternative for zooming about the center. */
    function zoomBy(factor: number): void {
        updateTransform(zoomImageTransform(transform.value, transform.value.zoom * factor, CENTER));
    }

    /** Restore the initial centered image framing. */
    function resetView(): void {
        if (props.disabled) return;
        resetGestures(); transform.value = { zoom: 1, panX: 0, panY: 0 };
    }

    /** Pan with arrow keys and zoom with plus or minus when the preview is focused. */
    function keyDown(event: KeyboardEvent): void {
        if (props.disabled) return;
        const step: number = event.shiftKey ? 0.08 : 0.02;
        const changes: Record<string, ImagePoint> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } };
        const change: ImagePoint | undefined = changes[event.key];
        if (change) updateTransform({ ...transform.value, panX: transform.value.panX + change.x, panY: transform.value.panY + change.y });
        else if (event.key === "+" || event.key === "=") zoomBy(1.1);
        else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.1);
        else if (event.key === "0") resetView();
        else return;
        event.preventDefault();
    }

    /** Draw exactly the framing that will be saved, including transparent uncovered areas. */
    function draw(): void {
        if (!canvas.value) return;
        const geometry: ImageGeometry = imageGeometry(props.image.naturalWidth, props.image.naturalHeight, transform.value, props.slot === "photo");
        canvas.value.width = geometry.outputSize; canvas.value.height = geometry.outputSize;
        const context: CanvasRenderingContext2D | null = canvas.value.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, geometry.outputSize, geometry.outputSize);
        context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
        context.drawImage(props.image, geometry.x, geometry.y, geometry.width, geometry.height);
    }

    /** Encode the current crop as a transparency-preserving square PNG. */
    function getPng(): string {
        draw();
        return canvas.value?.toDataURL("image/png").split(",")[1] ?? "";
    }
    defineExpose({ getPng });
    watch(canvas, draw);
    watch(transform, draw, { flush: "post" });
    watch((): HTMLImageElement => props.image, (): void => { resetView(); draw(); });
    watch((): ProfileImageSlot => props.slot, (): void => { resetView(); draw(); });
    watch((): boolean => props.disabled, (disabled: boolean): void => { if (disabled) resetGestures(); });
    onBeforeUnmount(resetGestures);
</script>

<template>
    <div class="ImageCropper">
        <div :class="['CropPreview', { Photo: slot === 'photo', Dragging: dragging }]" tabindex="0" role="group" :aria-label="t('profileImages.preview')" :aria-describedby="instructionsId" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd" @wheel.prevent="wheel" @keydown="keyDown">
            <canvas ref="canvas" :aria-label="t('profileImages.preview')" />
        </div>
        <p :id="instructionsId">{{ t('profileImages.gestures') }}</p>
        <div class="CropActions">
            <UButton variant="outline" :disabled="disabled" :aria-label="t('profileImages.zoomOut')" @click="zoomBy(1 / 1.2)">−</UButton>
            <UButton variant="outline" :disabled="disabled" :aria-label="t('profileImages.zoomIn')" @click="zoomBy(1.2)">+</UButton>
            <UButton variant="outline" :disabled="disabled" @click="resetView">{{ t('profileImages.reset') }}</UButton>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .ImageCropper { display: grid; gap: calc(var(--spacing) * 3); }
    .CropPreview { width: min(100%, 20rem); aspect-ratio: 1; margin: auto; touch-action: none; user-select: none; cursor: grab; overflow: hidden; background-color: var(--ui-bg); background-image: conic-gradient(var(--ui-bg-accented) 25%, transparent 0 50%, var(--ui-bg-accented) 0 75%, transparent 0); background-size: 1rem 1rem; }
    .CropPreview.Photo { border-radius: 50%; }
    .CropPreview.Dragging { cursor: grabbing; }
    .CropPreview:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: calc(var(--spacing) * 2); }
    canvas { width: 100%; height: 100%; display: block; pointer-events: none; }
    .CropActions { display: flex; gap: calc(var(--spacing) * 3); flex-wrap: wrap; }
</style>
