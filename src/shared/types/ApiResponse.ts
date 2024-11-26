/**
 * Standard API response type. (Generic)
 */
export type ApiResponse<T> =
	| {
			data: T;
			success: true;
	  }
	| {
			error: string;
			success: false;
	  };
