export const NumberToDate = (num: number): Date => {
	return new Date(num);
};

export const NumberToDateOrNull = (num: number | null): Date | null => {
	if (num === null) {
		return null;
	}
	return new Date(num);
};

export const DateToNumber = (date: Date): number => {
	return date.getTime();
};

export const DateToNumberOrNull = (date: Date | null): number | null => {
	if (date === null) {
		return null;
	}
	return date.getTime();
};
