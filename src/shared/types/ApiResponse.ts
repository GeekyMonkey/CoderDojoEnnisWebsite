import type { ValidationFieldError } from "../utils/ValidationErrors";

/**
 * Standard API response type. (Generic)
 */
export type ApiResponse<T> =
	| {
			data: T;
			success: true;
			logs?: string[];
	  }
	| {
			error: string;
			validationErrors?: ValidationFieldError[];
			success: false;
			logs?: string[];
	  };
