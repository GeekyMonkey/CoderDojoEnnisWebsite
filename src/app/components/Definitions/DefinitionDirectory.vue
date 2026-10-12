<script setup lang="ts">
 import CategoryImage from "~/components/Categories/CategoryImage.vue";
 import { computed, ref, type ComputedRef, type Ref } from "vue";
 import { definitionSearchSchema, DEFINITION_PATHS, type Definition, type DefinitionFields, type DefinitionKind } from "#shared/types/DefinitionMaintenance";
 import { useDefinitionMaintenanceStore } from "~/stores/useDefinitionMaintenanceStore";
 const props = defineProps<{ kind: DefinitionKind }>();
 const { t } = useI18n();
 const store: ReturnType<typeof useDefinitionMaintenanceStore> = useDefinitionMaintenanceStore();
 const { definitions,categories,isPending,isError,isSaving } = store;
 const search: Ref<string> = ref("");
 const creating: Ref<boolean> = ref(false);
 const title: ComputedRef<string> = computed((): string => t(`nav.${props.kind === "belt" ? "Belts" : props.kind === "badge" ? "Badges" : "Badge Categories"}`));
 const categoryNames: ComputedRef<Record<string, string>> = computed((): Record<string, string> => Object.fromEntries(categories.value.map((value: Definition): [string, string] => [value.id, value.name])));
 const categoryLabels: ComputedRef<Record<string, string>> = computed((): Record<string, string> => Object.fromEntries(definitions.value.map((value: Definition): [string, string] => [value.id, categoryNames.value[value.categoryId ?? ""] || t("definitionMaintenance.unavailableCategory")])));
 const visible: ComputedRef<Definition[]> = computed((): Definition[] => {
  const parsed: ReturnType<typeof definitionSearchSchema.safeParse> = definitionSearchSchema.safeParse(search.value);
  if (!parsed.success) return [];
  const term: string = parsed.data.toLocaleLowerCase();
  return definitions.value.filter((value: Definition): boolean => value.kind === props.kind && `${value.name} ${props.kind === "badge" ? categoryLabels.value[value.id] : ""}`.toLocaleLowerCase().includes(term)).sort((a: Definition, b: Definition): number => (props.kind === "belt" ? (a.sortOrder ?? 0) - (b.sortOrder ?? 0) : props.kind === "badge" ? (categoryLabels.value[a.id] ?? "").localeCompare(categoryLabels.value[b.id] ?? "") : 0) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
 });
 /** Create the selected definition through the shared maintenance store. */
 async function create(fields: DefinitionFields): Promise<Definition> { return store.create(props.kind,fields); }
 /** Open the created definition's display page. */
 async function created(value: Definition): Promise<void> { creating.value = false; await navigateTo(`/mentor/maintenance/${DEFINITION_PATHS[props.kind]}/${value.id}`); }
</script>
<template>
 <UDashboardPanel :id="`mentor-maintenance-${kind}`">
  <template #header><DashboardHeading :pageTitle="title" /></template>
  <template #body><div class="DefinitionDirectory">
   <div class="DefinitionToolbar"><UInput v-model="search" :placeholder="t('definitionMaintenance.search')" :aria-label="t('definitionMaintenance.search')" maxlength="200" /><UButton @click="creating = true">{{ t('definitionMaintenance.create') }}</UButton></div>
   <UPageCard v-if="creating" :title="t('definitionMaintenance.create')"><DefinitionForm :kind="kind" :definition="null" :categories="categories" :saving="isSaving" :save="create" @saved="created" @cancel="creating = false" /></UPageCard>
   <p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('definitionMaintenance.loadError')" />
   <ul v-else class="DefinitionList"><li v-for="value in visible" :key="value.id"><NuxtLink :to="`/mentor/maintenance/${DEFINITION_PATHS[kind]}/${value.id}`"><CategoryImage v-if="kind === 'category'" :id="value.id" :name="value.name" :populated="value.hasImage" :revision="value.imageRevision" size="sm" /><ColourSwatch v-if="kind === 'belt'" :hexCode="value.hexCode" /><span>{{ value.name || '—' }}<small v-if="kind === 'badge'">{{ categoryLabels[value.id] }}</small></span></NuxtLink></li></ul>
   <p v-if="!isPending && !isError && !visible.length">{{ t('definitionMaintenance.empty') }}</p>
  </div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .DefinitionDirectory { display:grid; gap:calc(var(--spacing) * 5); padding:calc(var(--spacing) * 4); max-width:70rem; }
 .DefinitionToolbar { display:flex; flex-wrap:wrap; gap:calc(var(--spacing) * 3); }
 .DefinitionList { list-style:none; padding:0; display:grid; gap:calc(var(--spacing) * 3); }
 .DefinitionList small { display: block; color: var(--ui-text-muted); }
 .DefinitionList a { display:flex; align-items:center; gap:calc(var(--spacing) * 3); padding:calc(var(--spacing) * 3); border:1px solid var(--ui-border); border-radius:var(--radius); }
</style>
