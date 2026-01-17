import type { MemberSupabaseModel } from "./models/MemberModel";

/**
 * Supabase user metadata
 */
export type SupabaseUserMetaType = MemberSupabaseModel | Record<string, any>;

/**
 * Format a bucket file name
 */
export const FormatBucketFileName = (prefix: string, guid: string, ext: string): string => {
	return `${prefix}_${guid.replace(/-/g, "")}.${ext}`;
}

/**
 * Format a full bucket file URL
 */
export const FormatBucketFileUrl = (bucketBaseUrl: string, folder: string, fileName: string): string => {
	return `${bucketBaseUrl}${folder}/${fileName}`;
}