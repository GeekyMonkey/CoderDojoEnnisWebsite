<script setup lang="ts">
	const router = useRouter();
	const { Logout } = useAuthState();

	definePageMeta({
		layout: "auth",
	});

	onMounted(async () => {
		await Logout();

		router.replace("/login");
	});
</script>

<template>
	<div>
		<!-- Nothing to see here. Redirecting -->
	</div>
</template>

<style scoped lang="scss"></style>
