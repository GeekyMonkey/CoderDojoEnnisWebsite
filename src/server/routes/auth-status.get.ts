import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	if (!user) {
		return {
			authenticated: false,
			userId: null,
			email: null,
		};
	}
	return {
		authenticated: true,
		userId: user.id,
		email: user.email,
	};
});
