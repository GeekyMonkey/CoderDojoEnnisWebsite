<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { BeltModel } from "#shared/types/models/BeltModel";

const props = withDefaults(defineProps<{
 belt: BeltModel | string | null;
 size?: "sm" | "md" | "lg";
 labelOverride?: string | null;
}>(), { size: "md" });

type BeltColorKey = "white" | "yellow" | "green" | "blue" | "red" | "black" | "noob" | "mentor" | "parent";
const { t }: { t: (key: string, values?: Record<string, string>) => string } = useI18n();
const open: Ref<boolean> = ref(false);
const model: ComputedRef<BeltModel | null> = computed((): BeltModel | null => typeof props.belt === "object" ? props.belt : null);
const colorKey: ComputedRef<BeltColorKey> = computed((): BeltColorKey => {
 const color: string = (model.value?.color ?? (typeof props.belt === "string" ? props.belt : "")).toLowerCase();
 return ["white", "yellow", "green", "blue", "red", "black", "mentor", "parent"].includes(color) ? color as BeltColorKey : "noob";
});
const label: ComputedRef<string> = computed((): string => {
 if (props.labelOverride) return props.labelOverride;
 if (colorKey.value === "mentor") return t("mentors.label");
 if (colorKey.value === "parent") return t("parents.label");
 if (colorKey.value === "noob") return t("memberBelt.noob");
 return t("memberBelt.label", { Color: t(`memberBelt.color.${colorKey.value}`) });
});
const description: ComputedRef<string> = computed((): string => model.value?.description?.trim() || t(colorKey.value === "noob" ? "memberBelt.noobDescription" : "memberBelt.noDescription"));
const colors: ComputedRef<Record<string, string>> = computed((): Record<string, string> => {
 const hex: string = model.value?.hexCode ?? "";
 const result: Record<string, string> = { "--belt-background": hex || `var(--belt_color-${colorKey.value})` };
 if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) {
  const full: string = hex.length === 4 ? [...hex.slice(1)].map((part: string): string => part + part).join("") : hex.slice(1);
  const channels: number[] = [0, 2, 4].map((offset: number): number => {
   const channel: number = Number.parseInt(full.slice(offset, offset + 2), 16) / 255;
   return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance: number = channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  result["--belt-foreground"] = (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000" : "#fff";
 }
 return result;
});

// Open belt details without toggling a surrounding achievement summary.
function showDetails(): void { open.value = true; }
</script>

<template>
 <div class="BeltDisplay" :class="`Size_${size}`">
  <UModal v-if="size !== 'sm'" v-model:open="open" :title="label" :description="t('belts.description')">
   <button type="button" class="MemberBelt" :class="`Color_${colorKey}`" :style="colors" aria-haspopup="dialog" :aria-expanded="open" @click.stop.prevent="showDetails">
    {{ label }}
   </button>
   <template #body><p class="BeltDescription">{{ description }}</p></template>
  </UModal>
  <span v-else class="MemberBelt" :class="`Color_${colorKey}`" :style="colors" :aria-label="label" :title="label"><span class="BeltLabel">{{ label }}</span></span>
 </div>
</template>

<style scoped lang="scss">
.BeltDisplay {
 --belt_color-white: white;
 --belt_color-yellow: yellow;
 --belt_color-green: green;
 --belt_color-blue: blue;
 --belt_color-red: red;
 --belt_color-black: black;
 --belt_color-parent: var(--ui-bg);
 --belt_color-noob: var(--ui-bg);
 --belt_color-mentor: purple;
}
.MemberBelt {
 display: block;
 box-sizing: border-box;
 border: solid 1px black;
 background-color: var(--belt-background);
 color: var(--belt-foreground, black);
 font-weight: bold;
 text-align: center;
 &.Color_blue, &.Color_red, &.Color_black { color: var(--belt-foreground, white); }
 &.Color_mentor { color: white; background: linear-gradient(green, black); }
 &.Color_parent { color: var(--ui-text); }
 &.Color_noob { border: dashed 2px var(--ui-border); color: var(--ui-text); }
}
.BeltDisplay {
 container: belt-display / inline-size;
 max-inline-size: 100%;
 min-inline-size: 0;
}
.Size_lg {
 inline-size: 100%;
 .MemberBelt { inline-size: 100%; min-block-size: 3rem; padding: calc(var(--spacing) * 2); }
}
.Size_md {
 display: inline-block;
 inline-size: 8rem;
 .MemberBelt { inline-size: 100%; min-block-size: 2rem; padding: var(--spacing); }
}
.Size_lg, .Size_md {
 .MemberBelt { cursor: pointer; overflow-wrap: anywhere; }
 .MemberBelt:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 2px; }
}
.Size_sm {
 display: inline-block;
 inline-size: 5rem;
 .MemberBelt { block-size: 32px; inline-size: 10px; margin-inline: auto; }
 .BeltLabel { display: none; }
}
@container belt-display (min-width: 4rem) {
 .Size_sm > .MemberBelt { block-size: auto; inline-size: 100%; }
 .Size_sm .BeltLabel { display: inline; }
}
.BeltDescription { white-space: pre-wrap; overflow-wrap: anywhere; }
@media print { .MemberBelt { print-color-adjust: exact; } }
</style>
