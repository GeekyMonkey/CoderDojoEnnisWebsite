<script setup lang="ts">
	import { SupabaseClient } from "@supabase/supabase-js";

	const router = useRouter();

	const supabase: SupabaseClient = useSupabaseClient();

	definePageMeta({
		layout: "auth",
	});

	supabase.auth.signOut({});

	router.replace("/login");
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<style scoped lang="scss"></style>
