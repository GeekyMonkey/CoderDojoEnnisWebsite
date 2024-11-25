export const Utf8Encode = (str: string): string => {
	const encoded = new TextEncoder().encode(str);
	return String.fromCharCode(...encoded);
};

export const Utf8EncodeOrNull = (str: string | null): string | null => {
	if (str === null) {
		return null;
	}
	return Utf8Encode(str);
};
