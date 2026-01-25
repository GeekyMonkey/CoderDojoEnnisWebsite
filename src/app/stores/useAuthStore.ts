import { type Session, type User } from "@supabase/supabase-js";
import type { MemberModel } from "~~/shared/types/models/MemberModel";

interface AuthState {
	user: Ref<User | null>;
	initializing: Ref<boolean>;
	ready: Ref<boolean>;
	roles: Ref<string[]>;
	error: Ref<string | null>;
	isAuthenticated: ComputedRef<boolean>;
	setUser: (u: User | null) => void;
	setRoles: (r: string[]) => void;
	setError: (e: string | null) => void;
	markReady: () => void;
	reset: () => void;
	login: (
		username: string,
		password: string,
	) => Promise<ApiResponse<{ session: Session; member: MemberModel }>>;
	loginWithNfc: (
		nfcTag: string,
	) => Promise<ApiResponse<{ session: Session; member: MemberModel }>>;
}

let _store: AuthState | null = null;

export function useAuthStore(): AuthState {
	if (_store) return _store;

	const user = ref<User | null>(null);
	const initializing = ref(true);
	const ready = ref(false);
	const roles = ref<string[]>([]);
	const error = ref<string | null>(null);

	const isAuthenticated = computed(() => !!user.value);

	function setUser(u: User | null) {
		user.value = u;
		if (initializing.value) initializing.value = false;
	}
	function setRoles(r: string[]) {
		roles.value = r;
	}
	function setError(e: string | null) {
		error.value = e;
	}
	function markReady() {
		ready.value = true;
		initializing.value = false;
	}
	function reset() {
		user.value = null;
		roles.value = [];
		error.value = null;
		initializing.value = false;
		ready.value = true;
	}

	/**
	 * Log in with username and password
	 */
	async function login(username: string, password: string) {
		const result = await $fetch<
			ApiResponse<{ session: Session; member: MemberModel }>
		>("/api/Auth/Login", {
			method: "POST",
			body: {
				username,
				password,
				credentials: "include",
			},
		});

		// We do NOT handle supabaseClient.auth.setSession here because useAuthStore
		// focuses on state, while the component or a dedicated composable might handle
		// the side-effect of updating the Supabase client.
		// However, typical strict store patterns might suggest putting it here.
		// For now, mirroring the existing architecture where the component handles the result.

		return result;
	}

	/**
	 * Log in with NFC tag value
	 */
	async function loginWithNfc(nfcTag: string) {
		const result = await $fetch<
			ApiResponse<{ session: Session; member: MemberModel }>
		>("/api/Auth/LoginNfcTag", {
			method: "POST",
			body: {
				nfcTag,
				credentials: "include",
			},
		});

		return result;
	}

	_store = {
		user,
		initializing,
		ready,
		roles,
		error,
		isAuthenticated,
		setUser,
		setRoles,
		setError,
		markReady,
		reset,
		login,
		loginWithNfc,
	};
	return _store;
}
