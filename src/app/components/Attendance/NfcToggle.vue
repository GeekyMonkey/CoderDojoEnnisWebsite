<script setup lang="ts">
import { computed } from "vue";
import { useNfc } from "~/composables/useNfc";

const props = defineProps<{
	onMessage: (message: NDEFMessage) => void;
	onError?: (error: string) => void;
}>();

const nfcActive = useLocalStorage("nfc-active", false);

const { isNfcSupported, scanning, nfcError } = useNfc(
	nfcActive,
	props.onMessage,
	props.onError
);

const toggleNfc = (): void => {
	if (!isNfcSupported) {
		return;
	}
	nfcActive.value = !nfcActive.value;
};

const iconClass = computed(() => {
	if (!isNfcSupported) {
		return 'NfcIconDisabled';
	}
	if (scanning.value) {
		return 'NfcIconScanning';
	}
	return 'NfcIconActive';
});
</script>

<template>
	<UButton
		:icon="'i-lucide-nfc'"
		:color="isNfcSupported ? 'primary' : 'secondary'"
		:variant="nfcActive ? 'link' : 'link'"
		:class="iconClass"
		:aria-label="isNfcSupported ? 'Toggle NFC scanning' : 'NFC not supported'"
		@click="toggleNfc"
	/>
</template>

<style lang="scss">
.NfcIconDisabled {
	display: none;
	opacity: 0.3 !important;
	cursor: not-allowed;
}

.NfcIconActive {
	opacity: 1;
}

.NfcIconScanning {
	animation: nfc-pulse 1s ease-in-out infinite;
}

@keyframes nfc-pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.4;
	}
}
</style>
