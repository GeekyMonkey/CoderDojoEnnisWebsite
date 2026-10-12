<script setup lang="ts">
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import type { BeltModel } from "#shared/types/models/BeltModel";
 import type { PublicMember } from "#shared/types/Coder";
 import MemberPhoto from "~/components/Members/MemberPhoto.vue";
 import ProfileExternalLinks from "./ProfileExternalLinks.vue";
 const props = defineProps<{member:PublicMember;currentBelt:BeltModel|null}>();
 const { t } = useI18n();
</script>
<template><UPageCard :title="`${member.nameFirst ?? ''} ${member.nameLast ?? ''}`"><span v-if="member.isNinja">{{ t('achievementReviews.currentBelt') }} <BeltColor :belt="currentBelt ?? 'noob'" size="md" /></span><MemberPhoto :member="member" size="lg" /><p>{{ t('maintenance.birthYear') }}: {{ member.birthYear ?? '—' }}</p><ProfileExternalLinks :member="member" /></UPageCard></template>
