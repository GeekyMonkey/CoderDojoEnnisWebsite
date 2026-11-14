import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateRequest } from "./validationError";

describe("request validation details", (): void => {
	it("names invalid route parameters", (): void => {
		expect((): string => validateRequest(z.uuid(), "invalid", "Invalid member ID", "memberId")).toThrowError(expect.objectContaining({ statusCode: 400, data: { validationErrors: [{ name: "memberId", message: "Invalid UUID" }] } }));
	});
	it("names rejected query keys without returning their values", (): void => {
		expect((): object => validateRequest(z.strictObject({}), { unexpected: "private-value" }, "Unexpected query fields")).toThrowError(expect.objectContaining({ statusCode: 400, data: { validationErrors: [{ name: "unexpected", message: "Unexpected field" }] } }));
	});
	it("preserves successful schema transformations", (): void => {
		expect(validateRequest(z.object({ search: z.string().trim() }), { search: " example " }, "Invalid query")).toEqual({ search: "example" });
	});
});
