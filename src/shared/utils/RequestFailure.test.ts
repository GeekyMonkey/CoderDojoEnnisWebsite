import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ValidationFieldError } from "./ValidationErrors";
import { requestFailureFields, requestFailureMessage } from "./RequestFailure";

describe("validation failure presentation", (): void => {
	it("extracts server field paths and provides a readable summary", (): void => {
		const failure: unknown = { data: { statusMessage: "Invalid maintenance fields", data: { validationErrors: [
			{ name: "fields.birthYear", message: "Birth year cannot be in the future" },
			{ name: "fields.fingerprintId", message: "Must be positive" },
		] } } };
		expect(requestFailureFields(failure)).toEqual([{ name: "birthYear", message: "Birth year cannot be in the future" }, { name: "fingerprintId", message: "Must be positive" }]);
		expect(requestFailureMessage(failure)).toBe("Birth year: Birth year cannot be in the future; Fingerprint id: Must be positive");
	});
	it("keeps nested signup and original snapshot paths distinct", (): void => {
		const failure: unknown = { data: { data: { validationErrors: [{ name: "account.birthYear", message: "Invalid year" }, { name: "expected.login", message: "Missing baseline" }] } } };
		expect(requestFailureFields(failure).map((error: ValidationFieldError): string => error.name)).toEqual(["account.birthYear", "expected.login"]);
	});
	it("handles local Zod failures without serializing submitted values", (): void => {
		const parsed: ReturnType<z.ZodString["safeParse"]> = z.string().min(20).safeParse("private-value");
		if (parsed.success) throw new Error("Expected validation failure");
		expect(requestFailureFields(parsed.error)).toHaveLength(1);
		expect(requestFailureMessage(parsed.error)).not.toContain("private-value");
	});
	it("preserves existing messages and ignores malformed validation details", (): void => {
		expect(requestFailureMessage({ data: { statusMessage: "Member changed; reload before saving", data: { validationErrors: [{ name: 1 }] } } })).toBe("Member changed; reload before saving");
		expect(requestFailureMessage(new Error("request https://private.test failed"))).toBeNull();
		expect(requestFailureFields(null)).toEqual([]);
	});
	it("keeps summaries within the notification message limit", (): void => {
		expect(requestFailureMessage({ data: { data: { validationErrors: [{ name: "login", message: "x".repeat(5000) }] } } })?.length).toBe(4000);
	});
});
