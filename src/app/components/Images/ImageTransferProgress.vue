<script setup lang="ts">
 const props = defineProps<{ preparing: boolean; saving: boolean }>();
 const { t } = useI18n();
</script>
<template>
	<div v-if="props.preparing || props.saving" role="status" aria-live="polite">
	<p>{{ t(props.preparing ? 'profileImages.preparingImage' : 'profileImages.uploadingImage') }}</p>
	<UProgress :modelValue="null" />
	</div>
	</template>
