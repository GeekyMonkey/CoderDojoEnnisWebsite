import type { User } from "@supabase/supabase-js";
import { z } from "zod";

/** Resolve the server-generated account identity without trusting editable metadata. */
export function mentorMemberId(user: User): string | null {
	const email: string = user.email ?? "";
	const suffix: string = "@coderdojoennis.com";
	const id: string = email.endsWith(suffix) ? email.slice(0, -suffix.length) : "";
	return user.email_confirmed_at && z.uuid().safeParse(id).success ? id : null;
}

