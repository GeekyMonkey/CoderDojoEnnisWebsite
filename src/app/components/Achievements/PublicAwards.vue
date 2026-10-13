<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { PublicAward } from "#shared/types/Coder";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 const props = defineProps<{awards:PublicAward[]}>();
 const { t,locale } = useI18n();
 const sorted:ComputedRef<PublicAward[]> = computed(():PublicAward[]=>[...props.awards].sort((a:PublicAward,b:PublicAward):number=>a.kind.localeCompare(b.kind)||(a.categoryName??"").localeCompare(b.categoryName??"")||a.sortOrder-b.sortOrder||a.label.localeCompare(b.label)));
 const dates:ComputedRef<Record<string,string>> = computed(():Record<string,string>=>Object.fromEntries(props.awards.map((award:PublicAward):[string,string]=>[award.id,award.awarded===null?"—":new Date(award.awarded).toLocaleDateString(locale.value)])));
</script>
<template><UPageCard :title="t('achievementReviews.awarded')"><p v-if="!sorted.length">{{ t('achievementReviews.empty') }}</p><article v-for="award in sorted" :key="award.id"><BeltColor v-if="award.belt" :belt="award.belt" size="lg" /><h3 v-else>{{ award.categoryName }} — {{ award.label }}</h3><p class="Description">{{ award.description }}</p><p>{{ t('achievementReviews.awarded') }}: {{ dates[award.id] }}</p></article></UPageCard></template>
<style scoped lang="scss">article { display:grid; gap:calc(var(--spacing)*2); border-top:1px solid var(--ui-border); padding-top:calc(var(--spacing)*3); } .Description { white-space:pre-wrap; overflow-wrap:anywhere; }</style>
