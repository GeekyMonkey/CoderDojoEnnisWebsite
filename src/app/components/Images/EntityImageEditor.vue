<script setup lang="ts">
	import { ref, type Ref } from "vue";
	import ImageEditor from "./ImageEditor.vue";
	import type { EntityImageAction } from "#shared/types/ImageUpload";

	const props = defineProps<{ identity: string; revision: string | null; populated: boolean; saving: boolean; change: (action: EntityImageAction) => Promise<unknown> }>();
	type ImageChange = { action: "upload"; png: string } | { action: "delete" };
	const baseline: Ref<string | null> = ref(null);

	/** Capture the revision before the user begins editing an image. */
	function choose(): void { baseline.value = props.revision; }

	/** Keep optimistic concurrency in the entity adapter. */
	async function change(action: ImageChange): Promise<unknown> {
		return props.change({ ...action, expectedRevision: action.action === "upload" ? baseline.value : props.revision });
	}
</script>

<template>
	<ImageEditor class="EntityImageEditor" :identity="identity" :populated="populated" :saving="saving" :change="change" @choose="choose"><slot /></ImageEditor>
</template>

<style scoped lang="scss">
	.EntityImageEditor { width: min(100%, 16rem); }
</style>
