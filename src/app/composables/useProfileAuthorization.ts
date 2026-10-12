/** Read the current session token for protected profile requests. */
export function useProfileAuthorization(): () => Promise<{ Authorization: string }> {
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	return async (): Promise<{ Authorization: string }> => {
		const { data, error } = await client.auth.getSession();
		if (error) throw error;
		if (!data.session) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
		return { Authorization: `Bearer ${data.session.access_token}` };
	};
}
