<script setup lang="ts">
	const router = useRouter();

	const { supabaseClient } = UseSupabaseClient();

	supabaseClient.auth.signOut({});

	router.replace("/login");
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<style scoped lang="css"></style>
