import { MemberModel } from "~~/shared/types/models/MemberModel";
import { members } from "../schema/schemas";
import { DateToNumberOrNull } from "~~/shared/utils/DateHelpers";
import { createHash } from "crypto";
import { md5 } from "cf-workers-hash";

export type MemberEntity = typeof members.$inferSelect;

// Runtime differences between Cloudflare Workers and Node.js
const isCloudflare =
	useRuntimeConfig().private.environment.runtime == "cloudflare";

let getMd5Hash;
if (isCloudflare) {
	// Cloudflare Workers environment
	getMd5Hash = async (text: string) => {
		const myDigest = await md5(text);
		// Convert hash to base64 URL-safe string
		const base64String = Buffer.from(myDigest, "binary").toString("base64");
		return base64String;
	};
} else {
	// Node.js environment
	getMd5Hash = async (text: string) => {
		const hash64: string = createHash("md5").update(text).digest("base64");
		// Convert to base64 URL-safe string
		return hash64;
	};
}

/**
 * Convert a UI Model
 */
export const ToMemberModel = (entity: MemberEntity): MemberModel => {
	// Exclude private properties
	const { passwordHash, ...rest } = entity;

	return {
		...rest,
		loginDate: DateToNumberOrNull(entity.loginDate),
		loginDatePrevious: DateToNumberOrNull(entity.loginDatePrevious),
	};
};

/**
 * Convert to an array of UI Models
 */
export const ToMemberModels = (entities: MemberEntity[]): MemberModel[] => {
	return entities.map(ToMemberModel);
};

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

	let hash64: string = await getMd5Hash(toHash);
	console.log("hash64", hash64);

	const base64String = hash64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	return base64String;
};
