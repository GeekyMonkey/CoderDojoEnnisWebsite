import { GeneratePasswordHash } from "./MemberEntity";

describe("GeneratePasswordHash", () => {
	const pass1 = "password-123";
	const pass2 = "password-987";
	const pass1Upper = "PASSword-123";
	const salt1 = "_Salty_";
	const salt2 = "!!Umami!!";

	it("should return null if password is empty", () => {
		expect(GeneratePasswordHash("", salt1)).toBeNull();
	});

	it("should generate a hash for a given password", () => {
		const password = "password123";
		const expectedHash = "iLSac0sNdXZ6-S4VUYGi6g"; // Example hash, replace with actual expected hash
		expect(GeneratePasswordHash(password, salt1)).toBe(expectedHash);
	});

	it("should generate different hashes for different passwords", () => {
		expect(GeneratePasswordHash(pass1, salt1)).not.toBe(
			GeneratePasswordHash(pass2, salt1),
		);
	});

	it("should generate same hashes for different case", () => {
		expect(GeneratePasswordHash(pass1, salt1)).toBe(
			GeneratePasswordHash(pass1Upper, salt1),
		);
	});

	it("should generate different hashes for different salt", () => {
		expect(GeneratePasswordHash(pass1, salt1)).not.toBe(
			GeneratePasswordHash(pass1, salt2),
		);
	});
});
