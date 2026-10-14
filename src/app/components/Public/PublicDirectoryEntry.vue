<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { PublicDirectoryEntry } from "~/stores/public/usePublicDirectoryStore";
const props: Props = defineProps<Props>();
type Props = { entry: PublicDirectoryEntry };
const avatarFailed: Ref<boolean> = ref<boolean>(false);
const displayName: ComputedRef<string> = computed<string>(() => [props.entry.FirstName, props.entry.LastName].filter(Boolean).join(" ") || props.entry.GithubLogin);
const projectUrl: ComputedRef<string> = computed<string>(() => `https://${props.entry.GithubLogin}.github.io`);
const avatarUrl: ComputedRef<string> = computed<string>(() => `https://avatars.githubusercontent.com/${encodeURIComponent(props.entry.GithubLogin)}`);
</script>
<template>
  <li><a class="project-link" :href="projectUrl">
    <img v-if="!avatarFailed" class="project-avatar" :src="avatarUrl" alt="" loading="lazy" @error="avatarFailed = true" />
    <span>{{ displayName }} ↗</span>
  </a></li>
</template>
