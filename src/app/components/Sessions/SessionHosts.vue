<script setup lang="ts">
 import type { SessionHost } from "#shared/types/CoderSession";
 import MemberPhoto from "~/components/Members/MemberPhoto.vue";
 const props = defineProps<{ hosts: SessionHost[] }>();
 const { t } = useI18n();
</script>
<template>
 <ul v-if="hosts.length" class="SessionHosts" :aria-label="t('sessions.hosts')">
  <li v-for="host in hosts" :key="host.id"><MemberPhoto :member="host" size="md" /><span>{{ host.nameFirst }} {{ host.nameLast }}</span></li>
 </ul>
</template>
<style scoped lang="scss">
 .SessionHosts { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); padding: 0; list-style: none; }
 li { display: flex; align-items: center; gap: calc(var(--spacing) * 3); min-width: 0; }
 span { overflow-wrap: anywhere; }
</style>
