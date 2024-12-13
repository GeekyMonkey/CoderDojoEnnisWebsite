/**
 * Sleep for a given amount of time (milliseconds)
 */
export const sleep = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Utility function to wait for a ref to have a value with a timeout
 */
export const waitForRefValue = async <T extends Ref>(
	ref: T,
	timeoutMs: number = 5000,
): Promise<T | null> => {
	const intervalMs = 100;
	let elapsedMs = 0;

	while (elapsedMs < timeoutMs) {
		if (ref.value) {
			console.log("Waited for ref value...", elapsedMs);
			return ref.value;
		}
		await sleep(intervalMs);
		elapsedMs += intervalMs;
		console.log("Waiting for ref value...", elapsedMs);
	}

	return null;
};
