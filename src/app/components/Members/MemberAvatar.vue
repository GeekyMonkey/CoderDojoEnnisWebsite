<script setup lang="ts">
import type { MemberModel } from "~~/shared/types/models/MemberModel";

const props = defineProps<{
  member: MemberModel;
}>();

const { MemberPhotoUrl, MemberAvatarUrl } = useUiConfig();

const src = computed(() => {
  if (props.member.hasPhoto) {
    return MemberPhotoUrl(props.member.id);
  }
  if (props.member.hasAvatar) {
    return MemberAvatarUrl(props.member.id);
  }
  return "nope";
});

const alt = computed(() => {
  const name = `${props.member.nameFirst || ""} ${props.member.nameLast || ""}`.trim();
  return name || props.member.login || "?";
});
</script>

<template>
  <UAvatar :src="src" :alt="alt" v-bind="$attrs" />
</template>
