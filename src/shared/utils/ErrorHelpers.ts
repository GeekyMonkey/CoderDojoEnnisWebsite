/**
 * Format a caught error or unknown value as string
 */
export const ErrorToString = (error: Error | unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};
