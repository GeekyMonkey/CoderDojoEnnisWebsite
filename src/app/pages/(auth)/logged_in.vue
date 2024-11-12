<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<script setup lang="ts">
	// import type { UserRoles } from "~~/shared/types/UserRoles";

	const router = useRouter();
	const user = useSupabaseUser();

	definePageMeta({
		layout: "auth",
	});

	// Where should we be based on the user's login state and role?
	if (!user.value) {
		router.replace("/login");
	} else {
		let defaultRole: UserRoles | null = null;

		const userId: string = user.value.id;
		// ToDo: Search for coder, mentor, or parent role matching user id
		// if (user.value.user_metadata) {
		// 	defaultRole = user.value.user_metadata.defaultRole;
		// }

		if (defaultRole) {
			router.replace(`/${defaultRole}`);
		} else {
			router.replace("/login");
		}
	}
</script>
