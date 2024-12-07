import hasher from "crypto-js/sha256";
import CryptoJS from "crypto-js";

/**
 * Generate a password hash
 */
export const GeneratePasswordHash = async (
	password: string,
	salt: string,
): Promise<string | null> => {
	if (!password) {
		return null;
	}
	const passClean = (password || "").toLowerCase().trim();
	const toHash = `${passClean}-${salt}`;
	console.log("toHash", toHash);

	const hash = hasher(toHash);
	const hash64: string = hash.toString(CryptoJS.enc.Hex);
	// console.log("hash64", hash64);

	const base64String = hash64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	console.log("hashed", base64String);

	return base64String;
};

/**
 * Check if the runtime is Cloudflare
 */
export const IsCloudflare = (): boolean => {
	return useRuntimeConfig().public.environment.runtime === "cloudflare";
};
