<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import { z } from "zod";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 const props = defineProps<{ member: Pick<MemberModel, "githubLogin" | "scratchName" | "xboxGamertag"> }>();
 type HandleKey = "githubLogin" | "scratchName" | "xboxGamertag";
 type ExternalLink = { key: HandleKey; service: string; url: string; icon: string };
 const { t } = useI18n();
 const HANDLE_SCHEMA: z.ZodString = z.string().trim().min(1).max(100);
 const links: ComputedRef<ExternalLink[]> = computed((): ExternalLink[] => (["githubLogin", "scratchName", "xboxGamertag"] as HandleKey[]).flatMap((key: HandleKey): ExternalLink[] => {
  const handle: ReturnType<typeof HANDLE_SCHEMA.safeParse> = HANDLE_SCHEMA.safeParse(props.member[key]);
  if (!handle.success) return [];
  const value: string = encodeURIComponent(handle.data);
  return [{ key, service: key === "githubLogin" ? "GitHub" : key === "scratchName" ? "Scratch" : "Xbox", url: key === "githubLogin" ? `https://github.com/${value}` : key === "scratchName" ? `https://scratch.mit.edu/users/${value}/` : `https://www.xbox.com/play/user?gamertag=${value}`, icon: "i-lucide-external-link" }];
 }));
</script>
<template>
	<div v-if="links.length" class="ProfileLinks">
	<UButton v-for="link in links" :key="link.key" :to="link.url" target="_blank" rel="noopener noreferrer" variant="outline" :icon="link.icon">{{ t('profile.openProfile', { service: link.service }) }}</UButton>
	</div>
	</template>
<style scoped lang="scss">.ProfileLinks { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }</style>
