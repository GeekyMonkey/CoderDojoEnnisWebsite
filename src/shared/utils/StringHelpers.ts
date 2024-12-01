/**
 * base64 encode a string
 */
export const Base64Encode = (str: string): string => {
	return Buffer.from(str).toString("base64");
};

/**
 * base64 decode a string
 */
export const Base64Decode = (str: string): string => {
	return Buffer.from(str, "base64").toString("utf-8");
};

/**
 * Suffix for a number like 1st, 2nd, 3rd, 4th, etc.
 */
export const IntegerSuffix = (n: number): string => {
	const d: number = (n || 0) % 100;
	if (d > 3 && d < 21) {
		return "th";
	}
	switch (d % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
	}
	return "th";
};

/**
 * UTF-8 encodes a string from Latin1
 */
export const Utf8Encode = (str: string): string => {
	const encoded = new TextEncoder().encode(str);
	const decoder = new TextDecoder("latin1");
	return decoder.decode(encoded);
};

/**
 * UTF-8 encodes a string or returns null if the input is null
 */
export const Utf8EncodeOrNull = (str: string | null): string | null => {
	if (str === null) {
		return null;
	}
	return Utf8Encode(str);
};
