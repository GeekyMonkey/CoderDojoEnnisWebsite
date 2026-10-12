<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import type { MemberModel } from "#shared/types/models/MemberModel";
import type { AchievementReview } from "#shared/types/AchievementReview";
const props = defineProps<{ member: MemberModel; award: AchievementReview }>();
const { t, locale } = useI18n();
const awardedMonth: ComputedRef<string> = computed((): string => props.award.awarded === null ? "" : new Intl.DateTimeFormat(locale.value, { month: "long", year: "numeric" }).format(props.award.awarded));
const colour: ComputedRef<Record<string, string>> = computed((): Record<string, string> => ({ "--belt-colour": /^#[0-9a-f]{6}$/i.test(props.award.belt?.hexCode ?? "") ? props.award.belt!.hexCode! : "#555555" }));
</script>
<template><article class="BeltCertificate" :style="colour"><p class="Dojo">CoderDojo Ennis</p><h1>{{ t('printing.certificate') }}</h1><p>{{ t('printing.awardedTo') }}</p><h2>{{ member.nameFirst }} {{ member.nameLast }}</h2><p class="BeltAward">{{ t('printing.beltAward', { belt: award.label }) }}</p><p>{{ awardedMonth }}</p></article></template>
<style scoped lang="scss">
.BeltCertificate { width: 277mm; min-height: 190mm; background: white; color: #111; border: 4mm double var(--belt-colour); padding: 15mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8mm; text-align: center; print-color-adjust: exact; } .Dojo { font-size: 8mm; } h1 { font-size: 12mm; } h2 { font-size: 16mm; overflow-wrap: anywhere; } p { font-size: 6mm; } .BeltAward { font-size: 10mm; }
@media screen and (max-width: 70rem) { .BeltCertificate { width: 100%; min-height: 60vh; padding: 1.5rem; } h2 { font-size: 2.5rem; } }
@media print { .BeltCertificate { width: 277mm; min-height: 190mm; break-inside: avoid; } }
</style>
