import { describe, it, expect } from "vitest";
import { applicationEvidenceSchema, applicationShowcaseSchema } from "./Coder";
const id: string = "00000000-0000-4000-8000-000000000001";
describe("application showcase contracts", (): void => {
	it("defaults old notes-only callers to no links", (): void => {
		expect(applicationEvidenceSchema.parse({ notes: "My evidence" })).toEqual({
			notes: "My evidence",
			showcaseItemIds: [],
		});
	});
	it("rejects duplicate and malformed UUIDs without weakening notes", (): void => {
		for (const showcaseItemIds of [[id, id], ["bad"], [null]])
			expect(
				applicationEvidenceSchema.safeParse({
					notes: "My evidence",
					showcaseItemIds,
				}).success,
			).toBe(false);
		expect(
			applicationEvidenceSchema.safeParse({
				notes: "no",
				showcaseItemIds: [id],
			}).success,
		).toBe(false);
	});
	it("requires exact application and baseline while permitting removal of all links", (): void => {
		expect(
			applicationShowcaseSchema.parse({
				kind: "belt",
				id,
				showcaseItemIds: [],
				expectedShowcaseItemIds: [id],
			}).showcaseItemIds,
		).toEqual([]);
		expect(
			applicationShowcaseSchema.safeParse({
				kind: "belt",
				id,
				showcaseItemIds: [],
			}).success,
		).toBe(false);
	});
});
