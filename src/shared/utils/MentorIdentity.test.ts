import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { mentorMemberId } from "./MentorIdentity";

const ID: string = "21630ded-fbf5-4ddc-9305-0db90c311ea8";

/** Build an auth response with deliberately untrusted role metadata. */
function user(email: string, confirmed: boolean = true): User {
	return { id: "auth-user", aud: "authenticated", created_at: "2026-10-10", app_metadata: {}, user_metadata: { memberId: "spoofed", isMentor: true }, email, email_confirmed_at: confirmed ? "2026-10-10" : undefined };
}

describe("mentor identity mapping", (): void => {
	it("uses the verified server-generated account email, ignoring user metadata", (): void => {
		expect(mentorMemberId(user(`${ID}@coderdojoennis.com`))).toBe(ID);
	});
	it("rejects unconfirmed, malformed and unrelated accounts", (): void => {
		expect(mentorMemberId(user(`${ID}@coderdojoennis.com`, false))).toBeNull();
		expect(mentorMemberId(user("spoofed@coderdojoennis.com"))).toBeNull();
		expect(mentorMemberId(user(`${ID}@example.com`))).toBeNull();
	});
});
