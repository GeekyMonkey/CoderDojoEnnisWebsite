import { describe, expect, it } from "vitest";
import { requireProfileAccess } from "./ProfilesData";
import type { VerifiedMember } from "#server/utils/requestMember";

/** Create an actor containing only the properties used by the access guard. */
function actor(id: string, isMentor: boolean): VerifiedMember {
	return { id, member: { isMentor } } as VerifiedMember;
}

describe("selected profile access", (): void => {
	it("allows one's own profile regardless of role", (): void => {
		expect((): void => requireProfileAccess(actor("own", false), "own")).not.toThrow();
	});
	it("rejects another profile for a non-mentor", (): void => {
		expect((): void => requireProfileAccess(actor("own", false), "other")).toThrow("Profile access denied");
	});
	it("allows a verified mentor to manage another profile", (): void => {
		expect((): void => requireProfileAccess(actor("own", true), "other")).not.toThrow();
	});
});
