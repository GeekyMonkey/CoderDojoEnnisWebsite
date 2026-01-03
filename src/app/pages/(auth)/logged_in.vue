<script setup lang="ts">
	const router = useRouter();
	const user = useSupabaseUser();

	const log = useLogger("auth/logged_in");

	definePageMeta({
		layout: "auth-layout",
	});

	// Where should we be based on the user's login state and role?
	if (!user.value) {
		log.warn("[auth/logged_in] No user found. Redirecting to login.");
		router.replace("/login");
	} else {
		let defaultRole: UserRoles | null = null;
		log.info("[auth/logged_in] User:", user.value);

		// const userId: string = user.value.id;
		// Search for coder, mentor, or parent role for user
		const userMeta: SupabaseUserMetaType | null =
			user.value?.user_metadata ?? null;
		if (userMeta) {
			if (userMeta.isMentor) {
				defaultRole = "mentor";
			} else if (userMeta.isParent) {
				defaultRole = "parent";
			} else if (userMeta.isNinja) {
				defaultRole = "coder";
			}
			console.log("[auth/logged_in] User default role:", defaultRole);
		}

		if (defaultRole) {
			router.replace(`/${defaultRole}`);
		} else {
			log.error("[auth/logged_in] No default role found.");
			// router.replace("/");
		}
	}
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>
