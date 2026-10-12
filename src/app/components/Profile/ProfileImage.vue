<script setup lang="ts">
    import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
    import type { ProfileImageSlot } from "#shared/types/ProfileImages";
    const props = defineProps<{ memberId: string; slot: ProfileImageSlot; revision: string }>();
    const { MemberPhotoUrl, MemberAvatarUrl } = useUiConfig();
    const legacy: Ref<boolean> = ref(false);
    const url: ComputedRef<string> = computed((): string => {
        const original: string = props.slot === "photo" ? MemberPhotoUrl(props.memberId) : MemberAvatarUrl(props.memberId);
        return `${legacy.value ? original : original.replace(/\.jpg$/, ".png")}?v=${encodeURIComponent(props.revision)}`;
    });
    watch((): string => `${props.memberId}:${props.slot}:${props.revision}`, (): void => { legacy.value = false; });
</script>

<template><img :src="url" :alt="$t(`profileImages.${slot}`)" :class="['ProfileImage', { Photo: slot === 'photo' }]" @error="legacy = true" /></template>

<style scoped lang="scss">
    .ProfileImage { width: 100%; aspect-ratio: 1; object-fit: contain; display: block; }
    .Photo { border-radius: 50%; object-fit: cover; }
</style>
