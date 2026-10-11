import { describe, expect, it } from "vitest";
import { teamFieldsSchema, teamUpdateSchema, teamDeleteSchema, type TeamFields } from "./TeamMaintenance";
/** Verify team inputs cannot inject protected fields or bypass colour and snapshot validation. */
describe("team maintenance contracts", (): void => {
 const fields: TeamFields = { teamName: " Team ", goal: "", notes: null, hexcode: "#12AB34" };
 it("normalizes blank optional fields", (): void => { expect(teamFieldsSchema.parse(fields)).toEqual({ ...fields, teamName: "Team", goal: null }); });
 it("rejects protected fields and invalid colours", (): void => { expect(teamFieldsSchema.safeParse({ ...fields, deleted: true }).success).toBe(false); expect(teamFieldsSchema.safeParse({ ...fields, hexcode: "red" }).success).toBe(false); });
 it("requires a complete snapshot for edits and deletes", (): void => { expect(teamUpdateSchema.safeParse({ fields }).success).toBe(false); expect(teamDeleteSchema.safeParse({ expected: {} }).success).toBe(false); });
});
