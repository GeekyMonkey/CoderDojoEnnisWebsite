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
			success: false;
			logs?: string[];
	  };
