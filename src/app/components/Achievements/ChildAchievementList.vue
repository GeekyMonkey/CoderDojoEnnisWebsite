<script setup lang="ts">
 import type {AchievementKind,AchievementReview} from "#shared/types/AchievementReview";
 import {useAchievementReviewsStore} from "~/stores/useAchievementReviewsStore";
 import {useAchievementPresentation} from "~/composables/useAchievementPresentation";
 import AchievementList from "./AchievementList.vue";
 const props = defineProps<{memberId:string;kind:AchievementKind;mode:"all"|"goals"}>();
 const {t} = useI18n();
 const store:ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore(props.kind,():string=>props.memberId,false,true);
 const {items,nextBelt} = useAchievementPresentation(props.kind,():AchievementReview[]|null=>store.data.value??null);
</script>
<template><p v-if="store.isPending.value">{{t('profile.loading')}}</p><UAlert v-else-if="store.isError.value" color="error" :title="t('achievementReviews.loadError')" /><AchievementList v-else :kind="kind" :mode="mode" :items="items" :nextBelt="nextBelt" /></template>
