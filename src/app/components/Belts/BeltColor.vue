<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { BeltModel } from "#shared/types/models/BeltModel";

const props = withDefaults(defineProps<{
 belt: BeltModel | string | null;
 mode?: "small" | "big";
 showLabel?: boolean;
 labelOverride?: string | null;
}>(), { mode: "big", showLabel: false });

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
 <div class="BeltDisplay" :class="`Mode_${mode}`">
  <UModal v-if="mode === 'big'" v-model:open="open" :title="label" :description="t('belts.description')">
   <button type="button" class="MemberBelt" :class="`Color_${colorKey}`" :style="colors" aria-haspopup="dialog" :aria-expanded="open" @click.stop.prevent="showDetails">
    {{ label }}
   </button>
   <template #body><p class="BeltDescription">{{ description }}</p></template>
  </UModal>
  <span v-else class="MemberBelt" :class="[`Color_${colorKey}`, { ShowLabel: showLabel }]" :style="colors" :aria-label="label" :title="label"><span class="BeltLabel">{{ label }}</span></span>
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
.Mode_big {
 width: 100%;
 min-width: 0;
 .MemberBelt { width: 100%; min-height: 3rem; padding: calc(var(--spacing) * 2); cursor: pointer; overflow-wrap: anywhere; }
 .MemberBelt:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 2px; }
}
.Mode_small {
 display: inline-block;
 .MemberBelt { height: 32px; width: 10px; }
 .BeltLabel { display: none; }
 .ShowLabel { height: auto; width: auto; }
 .ShowLabel .BeltLabel { display: inline; }
}
.BeltDescription { white-space: pre-wrap; overflow-wrap: anywhere; }
@media print { .MemberBelt { print-color-adjust: exact; } }
</style>
