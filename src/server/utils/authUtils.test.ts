import { GeneratePasswordHash } from "./authUtils";
import { describe, it, expect } from "vitest";

// Test suite for GeneratePasswordHash. Uses Vitest globals; importing explicitly
// prevents ReferenceError: describe is not defined when tsconfig/types isn't set.

describe("GeneratePasswordHash", () => {
	const pass1 = "password-123";
	const pass2 = "password-987";
	const pass1Upper = "PASSword-123";
	const salt1 = "_Salty_";
	const salt2 = "!!Umami!!";

	it("should return null if password is empty", async () => {
		expect(await GeneratePasswordHash("", salt1)).toBeNull();
	});

	it("should generate a hash for a given password", async () => {
		const password = "password123";
		// Precomputed: sha256("password123-_Salty_")
		const expectedHash = "bb66d4e66d707fbc22c4490c50a063fe0bc4ba0b6ce72703378d45725ee28f93";
		const hash = await GeneratePasswordHash(password, salt1);
		expect(hash).toBe(expectedHash);
	});

	it("should generate different hashes for different passwords", async () => {
		expect(await GeneratePasswordHash(pass1, salt1)).not.toBe(
			await GeneratePasswordHash(pass2, salt1),
		);
	});

	it("should generate same hashes for different case", async () => {
		expect(await GeneratePasswordHash(pass1, salt1)).toBe(
			await GeneratePasswordHash(pass1Upper, salt1),
		);
	});

	it("should generate different hashes for different salt", async () => {
		expect(await GeneratePasswordHash(pass1, salt1)).not.toBe(
			await GeneratePasswordHash(pass1, salt2),
		);
	});
});
