import { ref, onUnmounted, watch, unref } from 'vue';

type NfcMessageCallback = (serialNumber: string, message: NDEFMessage) => void;
type NfcErrorCallback = (error: string) => void;

let ndef: NDEFReader | null = null;

/**
 * Vue Composable for NFC (NDEF) functionality
 */
export function useNfc(
	active: MaybeRef<boolean>,
	onMessage: NfcMessageCallback,
	onError?: NfcErrorCallback
) {
	const isNfcSupported = 'NDEFReader' in window;
	const nfcError = ref<string | null>(null);
	const scanning = ref<boolean>(false);
	let abortController: AbortController | null = null;

	const startScanning = async (): Promise<void> => {
		if (!isNfcSupported) {
			nfcError.value = 'NFC is not supported on this device.';
			return;
		}

		try {
			if (!ndef) {
				ndef = new NDEFReader();
			}

			abortController = new AbortController();

			ndef.onreading = (event: NDEFReadingEvent) => {
				onMessage(event.serialNumber, event.message);
			};

			ndef.onreadingerror = (event: Event) => {
				const errorMsg = 'Error reading NFC tag.';
				nfcError.value = errorMsg;
				onError?.(errorMsg);
			};

			await ndef.scan({ signal: abortController.signal });
			scanning.value = true;
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Failed to start NFC scanning.';
			nfcError.value = errorMsg;
			onError?.(errorMsg);
			scanning.value = false;
		}
	};

	const stopScanning = (): void => {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		scanning.value = false;
		nfcError.value = null;
	};

	watch(
		() => unref(active),
		async (isActive) => {
			if (isActive && !scanning.value) {
				await startScanning();
			} else if (!isActive && scanning.value) {
				stopScanning();
			}
		}
	);

	onUnmounted(() => {
		stopScanning();
	});

	return {
		isNfcSupported,
		nfcError,
		startScanning,
		stopScanning,
		scanning,
	};
}