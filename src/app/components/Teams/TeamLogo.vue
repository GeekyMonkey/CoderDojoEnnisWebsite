<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 import { useTeamsStore } from "~/stores/useTeamsStore";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import mentorIcon from "~/assets/icons/mentor.svg";
 import unassignedIcon from "~/assets/icons/unassigned.svg";
 const props = defineProps<{ for: MemberModel | TeamModel | "MENTORS" | "UNASSIGNED" | null; size: "sm" | "md" | "lg" | "fill"; borderColor?: string | null }>();
 const { TeamLogoUrl } = useUiConfig();
 const { TeamsById } = useTeamsStore();
 const failed: Ref<boolean> = ref(false);
 const team: ComputedRef<TeamModel | null> = computed((): TeamModel | null => typeof props.for === "object" && props.for ? ("teamName" in props.for ? props.for : TeamsById.value[props.for.teamId ?? ""] ?? null) : null);
 const source: ComputedRef<string> = computed((): string => {
  if (props.for === "MENTORS") return mentorIcon;
  if (!team.value || team.value.hasImage === false || failed.value) return unassignedIcon;
  const original: string = TeamLogoUrl(team.value.id);
  return team.value.imageRevision ? original.replace(/\.jpg$/, `_${team.value.imageRevision}.png`) : original;
 });
 const label: ComputedRef<string> = computed((): string => team.value?.teamName ?? (props.for === "MENTORS" ? "Mentors" : ""));
 const outline: ComputedRef<Record<string, string>> = computed((): Record<string, string> => ({ "--image-border-color": props.borderColor ?? "transparent" }));
 watch((): string => `${team.value?.id}:${team.value?.imageRevision}:${team.value?.hasImage}`, (): void => { failed.value = false; });
</script>
<template><span class="TeamLogo" :class="`Size_${size}`" :style="outline"><img :src="source" :alt="label" @error="failed = true" /></span></template>
<style scoped lang="scss">
 .TeamLogo { display: inline-flex; flex-shrink: 0; border: 2px solid var(--image-border-color, transparent); border-radius: var(--radius); } .Size_fill { width: 100%; height: 100%; } .Size_sm { width: 2rem; height: 2rem; } .Size_md { width: 3rem; height: 3rem; } .Size_lg { width: 4rem; height: 4rem; } img { width: 100%; height: 100%; object-fit: contain; }
</style>
