<script setup lang="ts">
import { QrcodeStream } from "vue-qrcode-reader";

type DOMRectReadOnly = {
	x: number;
	y: number;
	width: number;
	height: number;
};

const props = defineProps<{ active: boolean }>();

const emit = defineEmits<{
	(event: "decoded", payload: string): void;
	(event: "error", message: string): void;
	(event: "toggle"): void;
}>();

const log = useLogger("common/QrCodeReader");

const isActive = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

type DetectedCode = {
	boundingBox?: { x: number; y: number; width: number; height: number };
	rawValue?: string;
};

/** Start scanning and reset any existing error */
const startScanning = () => {
	errorMessage.value = null;
	isActive.value = true;
	log.info("[QR] start scanning");
};

/** Stop scanning and release the camera */
const stopScanning = () => {
	isActive.value = false;
	log.info("[QR] stop scanning");
};

/** Handle decoded QR payload */
const handleDecode = (decoded: string) => {
	if (!decoded) {
		log.warn("[QR] decoded empty payload");
		return;
	}
	log.info("[QR] decoded", { decoded });
	emit("decoded", decoded);
};

/** Log detected codes even if decode does not fire */
const handleDetect = (detectedCodes: DetectedCode[]) => {
	const boxes = detectedCodes
		.map((code) => code.boundingBox)
		.filter((box): box is DOMRectReadOnly => Boolean(box))
		.map((box) => ({ x: box.x, y: box.y, width: box.width, height: box.height }));
	const values = detectedCodes
		.map((code) => code.rawValue?.trim())
		.filter((value): value is string => Boolean(value));
	log.info("[QR] detect", { count: detectedCodes.length, boxes, values });

	for (const value of values) {
		log.info("[QR] emit", { value });
		emit("decoded", value);
	}
};

const emitToggle = () => {
	emit("toggle");
};

/** Surface camera or decoding errors */
const handleError = (error: Error) => {
	const message: string = error?.message || "Unable to access camera";
	errorMessage.value = message;
	log.error("[QR] error", undefined, error);
	emit("error", message);
};

/** Draw a thick green border around detected QR codes */
const drawBoundingBox = (detectedCodes: DetectedCode[], ctx: CanvasRenderingContext2D) => {
	if (!ctx || !ctx.canvas) return;
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.lineWidth = 6;
	ctx.strokeStyle = "#16a34a"; // green-600
	ctx.shadowColor = "rgba(22, 163, 74, 0.35)";
	ctx.shadowBlur = 8;

	for (const code of detectedCodes) {
		if (!code.boundingBox) continue;
		const { x, y, width, height } = code.boundingBox;
		ctx.strokeRect(x, y, width, height);
	}
};

watch(
	() => props.active,
	(next) => {
		if (next) {
			startScanning();
		} else {
			stopScanning();
		}
	},
	{ immediate: true },
);
</script>

<template>
	<div class="QrCodeReader" :data-active="isActive" @click="emitToggle">
		<ClientOnly>
			<div v-if="isActive" class="QrLive" data-test="qr-live">
				<QrcodeStream
					:track="drawBoundingBox"
					@detect="handleDetect"
					@decode="handleDecode"
					@error="handleError"
				/>
			</div>
			<div v-else class="QrPlaceholder" data-test="qr-placeholder">
				<slot name="placeholder">
					<span>{{ $t('signIn.qrPlaceholder') }}</span>
				</slot>
			</div>
		</ClientOnly>

		<UAlert
			v-if="errorMessage"
			class="QrError"
			color="error"
			icon="i-lucide-camera-off"
			:title="errorMessage"
			data-test="qr-error"
		/>
	</div>
</template>

<style scoped lang="scss">
.QrCodeReader {
	display: grid;
	gap: calc(var(--spacing) * 1);
	border: 1px dashed var(--color-gray-300, #d1d5db);
	border-radius: var(--radius-md, 12px);
	padding: calc(var(--spacing) * 1.5);
	background: var(--color-gray-50, #f9fafb);
	cursor: pointer;
}

.QrCodeReader[data-active="true"] {
	background: var(--color-gray-100, #f3f4f6);
}

.QrLive {
	width: 100%;
	border-radius: var(--radius-md, 12px);
	overflow: hidden;
}

.QrPlaceholder {
	min-height: 180px;
	display: grid;
	place-items: center;
	text-align: center;
	color: var(--color-gray-600, #4b5563);
	background: repeating-linear-gradient(
		45deg,
		rgba(0, 0, 0, 0.02),
		rgba(0, 0, 0, 0.02) 10px,
		rgba(0, 0, 0, 0.04) 10px,
		rgba(0, 0, 0, 0.04) 20px
	);
	border-radius: var(--radius-md, 12px);
	padding: calc(var(--spacing) * 2);
}

.QrError {
	margin: 0;
}
</style>
