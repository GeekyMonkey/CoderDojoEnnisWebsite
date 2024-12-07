import { createHash } from "crypto";
import { md5 } from "cf-workers-hash";

/**
 * Generate a password hash
 */
export const GeneratePasswordHash = async (
	password: string,
	salt: string,
	isCloudflare?: boolean,
): Promise<string | null> => {
	if (!password) {
		return null;
	}
	const passClean = (password || "").toLowerCase().trim();
	const toHash = `${passClean}-${salt}`;
	console.log("toHash", toHash);

	let hash64: string;
	if (isCloudflare ?? IsCloudflare()) {
		const myDigest = await md5(toHash);
		hash64 = Buffer.from(myDigest, "binary").toString("base64");
	} else {
		hash64 = createHash("md5").update(toHash).digest("base64");
	}

	console.log("hash64", hash64);

	const base64String = hash64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	return base64String;
};

/**
 * Check if the runtime is Cloudflare
 */
export const IsCloudflare = (): boolean => {
	return useRuntimeConfig().public.environment.runtime === "cloudflare";
};
