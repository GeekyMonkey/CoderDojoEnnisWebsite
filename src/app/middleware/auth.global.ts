import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
	const { IsAuthenticated, RefreshSession } = useAuthState();

	let redirectToLogin: boolean = false;
	const section = to?.path.split("/")[1];
	console.log(`[Auth_middleware] to ${section}`, { to, from });

	switch (section) {
		case "mentor":
		case "coder":
		case "parent":
			redirectToLogin = !IsAuthenticated.value;
			// ToDo: Check if user has the required role
			break;
		default:
			return;
	}

	if (!redirectToLogin) {
		const refreshSuccess: boolean = await RefreshSession();
		if (!refreshSuccess) {
			redirectToLogin = true;
		}
	}

	if (redirectToLogin) {
		return navigateTo("/login");
	}
});
