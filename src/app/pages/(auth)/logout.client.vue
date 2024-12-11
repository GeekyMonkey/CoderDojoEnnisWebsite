<script setup lang="ts">
	import { useRouter } from "nuxt/app";
	import { UseSupabaseClient } from "~/composables/UseSupabaseClient";

	const router = useRouter();

	const { supabaseClient } = UseSupabaseClient();

	definePageMeta({
		layout: "auth",
	});

	supabaseClient.auth.signOut({});

	router.replace("/login");
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<style scoped lang="scss"></style>
