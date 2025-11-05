/**
 * Recursive utility type to broaden all nested literals to strings
 */
export type BroadenLiterals<T> =
	T extends Record<string, any>
		? { [K in keyof T]: BroadenLiterals<T[K]> }
		: string;
