/** Read the current session token for protected profile requests. */
export function useProfileAuthorization(): () => Promise<{ Authorization: string }> {
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	return async (): Promise<{ Authorization: string }> => {
		const { data, error } = await client.auth.getSession();
		if (error || !data.session) throw new Error("Authentication required");
		return { Authorization: `Bearer ${data.session.access_token}` };
	};
}
