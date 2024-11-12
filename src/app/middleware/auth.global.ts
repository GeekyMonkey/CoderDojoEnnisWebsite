import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to, from) => {
	let redirectToLogin: boolean = false;
	const authenticated = isAuthenticated();
	const section = to?.path.split("/")[1];
	// console.log(`[Auth_middleware] to ${section}`, { to, from });

	switch (section) {
		case "mentor":
		case "coder":
		case "parent":
			redirectToLogin = !authenticated;
			// ToDo: Check if user has the required role
			break;
	}

	if (redirectToLogin) {
		return navigateTo("/login");
	}
});

function isAuthenticated() {
	const user = useSupabaseUser();
	// console.log(`[Auth_middleware]`, { user: user?.value });
	return user?.value?.aud === "authenticated";
}
