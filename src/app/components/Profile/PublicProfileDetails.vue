<script setup lang="ts">
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import type { BeltModel } from "#shared/types/models/BeltModel";
 import type { PublicMember } from "#shared/types/Coder";
 import MemberPhoto from "~/components/Members/MemberPhoto.vue";
 import MemberAvatar from "~/components/Members/MemberAvatar.vue";
 import ProfileFieldsDisplay from "./ProfileFieldsDisplay.vue";
 const props = withDefaults(defineProps<{member:PublicMember;currentBelt:BeltModel|null;showImages?:boolean}>(),{showImages:true});
 const { t } = useI18n();
</script>
<template><UPageCard :title="`${member.nameFirst ?? ''} ${member.nameLast ?? ''}`"><div v-if="member.isNinja">{{ t('achievementReviews.currentBelt') }} <BeltColor :belt="currentBelt ?? 'noob'" size="lg" /></div><div v-if="showImages" class="PublicProfileImages"><MemberAvatar :member="member" size="lg" /><MemberPhoto v-if="member.hasPhoto" :member="member" size="sm" /></div><ProfileFieldsDisplay :member="member" /></UPageCard></template>


<style scoped lang="scss">.PublicProfileImages{display:flex;align-items:end;gap:calc(var(--spacing)*3);}</style>
