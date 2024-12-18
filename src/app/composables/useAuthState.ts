import type { Session } from "@supabase/gotrue-js";
import { GetAnonymousUser, type UserModel } from "~~/shared/types/UserModel";
import { useLocalStorage } from "@vueuse/core";
import Logout from "~/pages/(auth)/logout.vue";

export type LoginResponse = {
	session: Session;
	member: MemberModel;
};

/**
 * User Local Storage
 */
const User = useLocalStorage<UserModel>("User_CD", GetAnonymousUser(), {
	deep: true,
});

/**
 * Auth State
 */
export function useAuthState() {
	const IsAuthenticated = computed(
		() => User.value.Member !== null && User.value.SupabaseUser !== null,
	);

	/**
	 * Login with username and password
	 */
	const LoginUsernamePass = async ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): Promise<boolean> => {
		const { supabaseClient } = useSupabase();

		const result = await $fetch<ApiResponse<LoginResponse>>(
			"/api/Auth/Login",
			{
				method: "POST",
				body: {
					username,
					password,
					credentials: "include", // Ensure cookies are included in the request
				},
			},
		);
		console.log("[AutState.Login] result:", result);
		if (result.success) {
			// console.log("JWT:", { session: result.data.session });
			const authResponse = await supabaseClient.auth.setSession(
				result.data.session,
			);
			console.log("[AutState.Login] Auth Response:", authResponse);

			const userRef = useSupabaseUser();
			const user = await waitForRefValue(userRef, 5000);

			if (!!user) {
				User.value = {
					Member: result.data.member,
					SupabaseUser: user.value,
				};
				console.log("[AuthStateLogin] User:", User.value);
				return true;
			}
		} else if (result.error) {
			console.error("[AuthState.Login] Error:", result.error);
		}

		return false;
	};

	/**
	 * Logout
	 */
	const Logout = async (): Promise<void> => {
		const { supabaseClient } = useSupabase();
		User.value = GetAnonymousUser();
		await supabaseClient.auth.signOut({});
	};

	/**
	 * Refresh Session
	 */
	const RefreshSession = async (): Promise<boolean> => {
		const { supabaseClient } = useSupabase();
		const authResponse = await supabaseClient.auth.refreshSession();
		if (authResponse.error || !authResponse.data?.user) {
			console.error(
				"[AuthState.RefreshSession] Error:",
				authResponse.error,
			);
			return false;
		}
		User.value = { ...User.value, SupabaseUser: authResponse.data.user };
		return true;
	};

	return {
		User,
		IsAuthenticated,
		LoginUsernamePass,
		Logout,
		RefreshSession,
	};
}
