<script setup lang="ts">
	const router = useRouter();

	const { supabaseClient } = UseSupabaseClient();

	await supabaseClient.auth.signOut({ scope: "local" });

	router.replace("/login");
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<style scoped lang="css"></style>
