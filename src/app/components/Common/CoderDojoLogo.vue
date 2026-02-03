<script lang="ts" setup>
	const props = defineProps<{
		size?: "sm" | "md" | "lg";
	}>();
</script>

<template>
	<div :class="`CoderDojoLogo Size_${props.size || 'md'}`">
		<img src="/assets/images/YingYang.png" alt="CoderDojo Logo" />
	</div>
</template>

<style scoped lang="css">
	.CoderDojoLogo {
		width: 64px;
		height: auto;
		margin: auto;

		&.Size_sm {
			width: 32px;
		}

		&.Size_lg {
			width: 128px;
		}

		img {
			width: 100%;
			height: auto;
		}
	}
</style>
