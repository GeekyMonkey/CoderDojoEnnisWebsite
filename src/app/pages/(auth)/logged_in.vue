<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<script setup lang="ts">
	const router = useRouter();
	const user = useSupabaseUser();

	definePageMeta({
		layout: "auth",
	});

	// Where should we be based on the user's login state and role?
	if (!user.value) {
		console.warn("[auth/logged_in] No user found. Redirecting to login.");
		router.replace("/login");
	} else {
		let defaultRole: UserRoles | null = null;
		console.log("[auth/logged_in] User:", user.value);

		// const userId: string = user.value.id;
		// Search for coder, mentor, or parent role for user
		const userMeta: SupabaseUserMetaType | null =
			user.value?.user_metadata ?? null;
		if (userMeta) {
			if (userMeta.isMentor) {
				defaultRole = "mentor";
			} else if (userMeta.isParent) {
				defaultRole = "parent";
			} else if (userMeta.isCoder) {
				defaultRole = "coder";
			}
			console.log("[auth/logged_in] User default role:", defaultRole);
		}

		if (defaultRole) {
			router.replace(`/${defaultRole}`);
		} else {
			console.error("[auth/logged_in] No default role found.");
			// router.replace("/");
		}
	}
</script>
