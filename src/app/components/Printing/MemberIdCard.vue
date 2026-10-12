<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 import BeltColor from "~/components/Belts/BeltColor.vue";
 import QRCode from "qrcode";
 import { z } from "zod";
 import type { MemberModel } from "#shared/types/models/MemberModel";
 import type { TeamModel } from "#shared/types/models/TeamModel";
 import type { AchievementReview } from "#shared/types/AchievementReview";
 import { useAchievementReviewsStore } from "~/stores/useAchievementReviewsStore";
 const props = defineProps<{ member: MemberModel; team: TeamModel }>();
 const emit = defineEmits<{ ready: [id: string, ready: boolean] }>();
 type BadgeCount = { name: string; count: number };
 const { t } = useI18n();
 const badges: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore("badge", (): string => props.member.id);
 const belts: ReturnType<typeof useAchievementReviewsStore> = useAchievementReviewsStore("belt", (): string => props.member.id);
 const currentBelt: ComputedRef<AchievementReview | null> = computed((): AchievementReview | null => [...(belts.data.value ?? [])].filter((value: AchievementReview): boolean => value.awarded !== null).sort((a: AchievementReview, b: AchievementReview): number => (b.awarded ?? 0) - (a.awarded ?? 0) || a.id.localeCompare(b.id))[0] ?? null);
 const qr: Ref<string | null> = ref(null);
 const failed: Ref<boolean> = ref(false);
 const awarded: ComputedRef<AchievementReview[]> = computed((): AchievementReview[] => (badges.data.value ?? []).filter((value: AchievementReview): boolean => value.awarded !== null));
 const categories: ComputedRef<BadgeCount[]> = computed((): BadgeCount[] => {
  const counts: Record<string, number> = {};
  for (const badge of awarded.value) { const name: string = badge.categoryName ?? t("definitionMaintenance.unavailableCategory"); counts[name] = (counts[name] ?? 0) + 1; }
  return Object.entries(counts).map(([name, count]: [string, number]): BadgeCount => ({ name, count })).sort((a: BadgeCount, b: BadgeCount): number => a.name.localeCompare(b.name));
 });
 /** Encode exactly the compact member UUID accepted by the legacy sign-in scanner. */
 async function encode(id: string): Promise<void> {
  qr.value = null; failed.value = false;
  try { const value: string = await QRCode.toDataURL(z.uuid().parse(id).replace(/-/g, ""), { errorCorrectionLevel: "M", margin: 2, width: 256 }); if (id === props.member.id) qr.value = value; }
  catch { failed.value = true; }
 }
 watch((): string => props.member.id, encode, { immediate: true });
 watch([qr, badges.isLoading, badges.isError, belts.isLoading, belts.isError], (): void => { emit("ready", props.member.id, Boolean(qr.value) && !badges.isLoading.value && !badges.isError.value && !belts.isLoading.value && !belts.isError.value); }, { immediate: true });
</script>
<template>
	<article class="MemberIdCard">
	<h2>{{ member.nameFirst }} {{ member.nameLast }}</h2>
	<p>{{ team.teamName }}</p>
	<div class="IdentityImages">
	<MemberAvatar :member="member" size="lg" linkTo="NONE" />
	<TeamLogo :for="team" size="lg" />
	<img v-if="qr" class="IdentityQr" :src="qr" :alt="`${member.nameFirst} ${member.nameLast} QR`" />
	<UAlert v-if="failed || badges.isError.value || belts.isError.value" color="error" :title="t('profile.loadError')" />
	</div>
	<p>{{ member.login ?? '—' }}</p>
	<div class="BadgeCounts">
	<span v-for="category in categories" :key="category.name">{{ category.name }}: {{ category.count }}</span>
	</div>
	<footer>
	<span>CoderDojo Ennis</span>
	<BeltColor :belt="currentBelt?.belt ?? 'noob'" size="md" />
	<span>{{ t('nav.Badges') }}: {{ awarded.length }}</span>
	</footer>
	</article>
	</template>
<style scoped lang="scss">
 .MemberIdCard { width: 100mm; max-width: 100%; min-height: 65mm; padding: 2.5mm; font-size: 3mm; line-height: 1.15; border: 1px dashed #555; background: white; color: #111; break-inside: avoid; display: grid; align-content: space-between; gap: 1mm; }
 h2 { line-height: 1.1; font-size: 5mm; font-weight: 700; } p { margin: 0; } .IdentityImages { display: flex; align-items: center; justify-content: space-between; gap: 2mm; } .IdentityQr { width: 24mm; height: 24mm; } .BadgeCounts { display: flex; flex-wrap: wrap; gap: 1mm; font-size: 3mm; } footer { display: flex; align-items: center; justify-content: space-between; gap: 2mm; font-size: 3mm; }
 footer :deep(.MemberBelt) { print-color-adjust: exact; width: 18mm; flex-shrink: 0; }
 @media print { .MemberIdCard { max-width: none; } }
</style>
