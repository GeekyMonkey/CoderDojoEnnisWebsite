import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EventHandlerRequest, H3Event } from "h3";
import { useLogger } from "~~/shared/utils/Logger";

const log = useLogger("DatabaseClient");

/**
 * Database access mode type
 * - 'anon': Uses anon key (default), respects RLS policies
 * - 'admin': Uses service_role key to bypass RLS
 */
export type DatabaseMode = "anon" | "admin";

/**
 * Supabase storage blob file info
 */
export type BlobFileInfo = {
  name: string; // "Member_00000000000000000000000000000000.jpg"
  id: string; // "989b1e47-e1b6-462b-9521-f86887af3f79"
  updated_at: string; // "2026-01-16T21:31:11.884Z"
  created_at: string; // "2026-01-16T21:31:11.884Z"
  last_accessed_at: string; // "2026-01-16T21:31:11.884Z"
  metadata: {
    eTag: string; // "\\\"854ffeb196e4024f13e89fbce9911ada-1\\\"
    size: number; // 68288
    mimetype: string; // "image/jpeg"
    cacheControl: string; // "max-age=3600"
    lastModified: string; // "2026-01-16T21:31:12.000Z"
    contentLength: number; // 68288
    httpStatusCode: number; // 200
  };
};

/**
 * Supabase storage blob folder info
 */
export type BlobFolderInfo = {
  folderName: string;
  files: BlobFileInfo[];
  error?: string;
};

// Common exported Supabase client type used across server services
export type SupabaseClientType = NonNullable<
  Awaited<ReturnType<typeof GetSupabaseAdminClient>>
>;

// Environment variables
const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  log.error("Missing required Supabase environment variables");
  process.exit(1);
}

if (!supabaseServiceKey) {
  log.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Admin mode will not be available.",
  );
}

// Symbol used to store client cache on event object
const CLIENT_CACHE_KEY_anon = Symbol("supabaseClientCache_anon");
const CLIENT_CACHE_KEY_admin = Symbol("supabaseClientCache_admin");

/**
 * Gets a client cache for the current request
 * This keeps the cache scoped to the request lifecycle
 */
function getEventCache(
  event: H3Event<EventHandlerRequest>,
  mode: DatabaseMode,
): Map<string, SupabaseClient> {
  // Cast to any to allow adding properties
  const eventObj = event as any;
  const cacheKey =
    mode === "admin" ? CLIENT_CACHE_KEY_admin : CLIENT_CACHE_KEY_anon;

  // Create cache if it doesn't exist
  if (!eventObj[cacheKey]) {
    eventObj[cacheKey] = new Map<string, SupabaseClient>();
  }

  return eventObj[cacheKey];
}

/**
 * Get a Supabase public access client
 */
export async function GetSupabaseClient(
  event: H3Event<EventHandlerRequest>,
  mode: DatabaseMode = "anon",
): Promise<SupabaseClient | null> {
  try {
    // Get cache for this specific request
    const cache = getEventCache(event, mode);

    // Create a simple cache key based just on the mode
    // Since cache is per-request, we don't need more complexity
    const cacheKey = mode;

    // Check if we already have a client for this request+mode
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) || null;
    }

    // Choose the appropriate API key based on mode
    let apiKey: string;

    if (mode === "admin") {
      // Use service role key to bypass RLS
      if (!supabaseServiceKey) {
        log.error(
          "Cannot use admin mode: SUPABASE_SERVICE_ROLE_KEY is not set",
        );
        return null;
      }
      apiKey = supabaseServiceKey;
      log.verbose("Using admin mode with service role key");
    } else {
      // Use anon key for regular access
      if (!supabaseAnonKey) {
        log.error("Cannot use anon mode: NUXT_PUBLIC_SUPABASE_KEY is not set");
        return null;
      }
      apiKey = supabaseAnonKey;
    }

    // Create a Supabase client with the selected API key
    const client = createClient(supabaseUrl as string, apiKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Cache the client for future use within this request
    cache.set(cacheKey, client);

    return client;
  } catch (error) {
    log.error("Error initializing Supabase client:", undefined, error);
    return null;
  }
}

/**
 * Get a Supabase read-write client with admin privileges (bypasses RLS)
 * Uses the same caching mechanism as GetSupabaseClient
 */
export async function GetSupabaseAdminClient(
  event: H3Event<EventHandlerRequest>,
): Promise<SupabaseClient | null> {
  return GetSupabaseClient(event, "admin");
}

/**
 * Get MIME type from file extension
 */
export const GetMimeTypeFromExtension = (ext: string): string => {
  switch (ext.toLowerCase()) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
};

/**
 * Format an image file name (relative to storage root)
 */
// export const FormatImageFileName = (
// 	ownerType: string,
// 	ownerId: string,
// 	imageId: string,
// 	ext: string,
// ): string => {
// 	return `${ownerType}/${ownerId}/${imageId}.${ext}`.replace(/-/g, "");
// };

/**
 * Save a file to supabase storage
 */
export const SaveFile = async ({
  event,
  filePath,
  file,
}: {
  event: H3Event<EventHandlerRequest>;
  filePath: string;
  file: File;
}): Promise<boolean> => {
  // Use admin client to bypass RLS
  const supabase = await GetSupabaseAdminClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return false;
  }

  const { data, error } = await supabase.storage
    .from("coderdojo")
    .upload(filePath, file, {
      upsert: true,
      metadata: {
        ownerType: filePath.split("/")[0],
        ownerId: filePath.split("/")[1],
      },
    });

  if (error) {
    log.error("Error saving file:", undefined, error);
    return false;
  }

  return true;
};

/**
 * Save a base64 image string to Supabase storage
 */
export const SaveBase64Image = async ({
  event,
  filePath,
  base64String,
  ext,
}: {
  event: H3Event<EventHandlerRequest>;
  filePath: string;
  base64String: string;
  ext: string;
}): Promise<boolean> => {
  // Use admin client to bypass RLS
  const supabase = await GetSupabaseAdminClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return false;
  }

  try {
    // Get content type from extension
    const contentType = GetMimeTypeFromExtension(ext);

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the bytes
    const blob = new Blob([bytes], { type: contentType });

    const { data, error } = await supabase.storage
      .from("coderdojo")
      .upload(filePath, blob, {
        upsert: true,
        contentType,
        metadata: {
          ownerType: filePath.split("/")[0],
          ownerId: filePath.split("/")[1],
        },
      });

    if (error) {
      log.error("Error saving base64 image:", undefined, error);
      return false;
    }

    return true;
  } catch (error) {
    log.error("Error processing base64 image:", undefined, error);
    return false;
  }
};

/**
 * Delete a file from storage
 */
export const DeleteFile = async ({
  event,
  filePath,
}: {
  event: H3Event<EventHandlerRequest>;
  filePath: string;
}): Promise<boolean> => {
  // Use admin client to bypass RLS
  const supabase = await GetSupabaseAdminClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return false;
  }

  const { data, error } = await supabase.storage
    .from("coderdojo")
    .remove([filePath]);

  if (error) {
    log.error("Error deleting file:", undefined, error);
    return false;
  }

  return true;
};

/**
 * Get the base url for a storage bucket
 */
export const GetBucketBaseUrl = async ({
  event,
  bucketName,
}: {
  event: H3Event<EventHandlerRequest>;
  bucketName?: string;
}): Promise<string | null> => {
  // Use default client mode for public storage operations (RLS applies)
  const supabase = await GetSupabaseClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return null;
  }
  try {
    const { data } = await supabase.storage
      .from(bucketName || "coderdojo")
      .getPublicUrl("");
    if (!data) {
      log.error("Error getting bucket URL:", undefined);
      return null;
    }
    return data.publicUrl;
  } catch (error) {
    log.error("Error getting bucket URL:", undefined, error);
    return null;
  }
};

/**
 * Get a reference to a folder in bucket storage
 */
export const GetBucketFolder = async ({
  event,
  folderPath,
}: {
  event: H3Event<EventHandlerRequest>;
  folderPath: string;
}): Promise<BlobFolderInfo> => {
  // Use default client mode for public storage operations (RLS applies)
  const supabase = await GetSupabaseAdminClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return {
      folderName: folderPath,
      files: [],
      error: "Supabase client not initialized",
    };
  }
  const bucketName: string = "coderdojo";
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 10_0000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      log.error("Error getting bucket folder:", undefined, error);
      return { folderName: folderPath, files: [], error: error.message };
    }

    return {
      folderName: folderPath,
      files: data as unknown as BlobFileInfo[],
    };
  } catch (error) {
    log.error("Error getting bucket folder:", undefined, error);
    return { folderName: folderPath, files: [], error: ErrorToString(error) };
  }
};

/**
 * Get a supabase storage image URL
 */
export const GetImageUrl = async ({
  event,
  filePath,
}: {
  event: H3Event<EventHandlerRequest>;
  filePath: string;
}): Promise<string | null> => {
  const bucketName: string = "coderdojo";
  const filePathClean = filePath.replace(/-/g, "");

  // Use default client mode for public storage operations (RLS applies)
  const supabase = await GetSupabaseClient(event);
  if (!supabase) {
    log.error("Supabase client is not initialized.");
    return null;
  }

  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePathClean);

    return data?.publicUrl ?? null;
  } catch (error) {
    log.error("Error getting image URL:", undefined, error);
    return null;
  }
};
