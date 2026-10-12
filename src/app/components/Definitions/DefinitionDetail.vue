<script setup lang="ts">
 import CategoryImageEditor from "~/components/Categories/CategoryImageEditor.vue";
 import type { EntityImageAction } from "#shared/types/ImageUpload";
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { computed, ref, type ComputedRef, type Ref } from "vue";
 import { definitionIdSchema, definitionSnapshot, DEFINITION_PATHS, type Definition, type DefinitionFields, type DefinitionKind } from "#shared/types/DefinitionMaintenance";
 import { useDefinitionMaintenanceStore } from "~/stores/useDefinitionMaintenanceStore";
 import { requestFailureMessage } from "#shared/utils/RequestFailure";
 const props = defineProps<{ kind: DefinitionKind; definitionId: string }>();
 const { t } = useI18n();
 const { publish } = useActionNotifications();
 const store: ReturnType<typeof useDefinitionMaintenanceStore> = useDefinitionMaintenanceStore();
 const { byId,categories,definitions,isPending,isError,isSaving } = store;
 const editing: Ref<boolean> = ref(false);
 const deleteSnapshot: Ref<DefinitionFields | null> = ref(null);

 const definition: ComputedRef<Definition | null> = computed((): Definition | null => { const value: Definition | null = byId.value[props.definitionId] ?? null; return value?.kind === props.kind ? value : null; });
 const valid: ComputedRef<boolean> = computed((): boolean => definitionIdSchema.safeParse(props.definitionId).success);
 const directoryTitle: ComputedRef<string> = computed((): string => t(`nav.${props.kind === "belt" ? "Belts" : props.kind === "badge" ? "Badges" : "Badge Categories"}`));
 const directoryPath: ComputedRef<string> = computed((): string => `/mentor/maintenance/${DEFINITION_PATHS[props.kind]}`);
 const staleDelete: ComputedRef<boolean> = computed((): boolean => !!definition.value && JSON.stringify(deleteSnapshot.value) !== JSON.stringify(definitionSnapshot(definition.value)));
 const category: ComputedRef<Definition | null> = computed((): Definition | null => byId.value[definition.value?.categoryId ?? ""] ?? null);
 const relatedBadges: ComputedRef<Definition[]> = computed((): Definition[] => definitions.value.filter((value: Definition): boolean => value.kind === "badge" && value.categoryId === props.definitionId));
 /** Publish category image changes through the shared definition store. */
 async function changeImage(action: EntityImageAction): Promise<Definition> { return store.changeImage(props.definitionId, action); }
 /** Save the selected definition through its store with an exact baseline. */
 async function save(fields: DefinitionFields,expected: DefinitionFields | null): Promise<Definition> { if(!expected) throw new Error(t("definitionMaintenance.notFound")); return store.save(props.kind,props.definitionId,{fields,expected}); }
 /** Capture the exact definition being confirmed for deletion. */
 function confirmDelete(): void { if(definition.value) {  deleteSnapshot.value = definitionSnapshot(definition.value); } }
 /** Soft-delete a confirmed definition while preserving achievement records. */
 async function remove(): Promise<void> {
  if(!deleteSnapshot.value || isSaving.value || staleDelete.value) return;
  try { await store.remove(props.kind,props.definitionId,{expected:deleteSnapshot.value}); publish({ name: "definitions.definitiondetail.success", severity: "success", message: t("actionNotifications.deleted") }); await navigateTo(directoryPath.value); }
  catch(failure: unknown) { publish({ name: "definitions.definitiondetail.error", severity: "error", message: requestFailureMessage(failure) ?? t("definitionMaintenance.saveError") }); }
 }
</script>
<template>
 <UDashboardPanel :id="`mentor-maintenance-${kind}-detail`">
  <template #header><DashboardHeading :pageTitle="definition?.name ?? t('definitionMaintenance.details')" :breadcrumbLabel="directoryTitle" :breadcrumbTo="directoryPath" /></template>
  <template #body><div class="DefinitionDetail">
   <p v-if="isPending">{{ t('profile.loading') }}</p><UAlert v-else-if="isError" color="error" :title="t('definitionMaintenance.loadError')" /><UAlert v-else-if="!valid || !definition" color="error" :title="t('definitionMaintenance.notFound')" />
   <template v-else>
    <UPageCard :title="t('profile.details')">
     <DefinitionForm v-if="editing" :key="definitionId" :kind="kind" :definition="definition" :categories="categories" :saving="isSaving" :save="save" @saved="editing = false" @cancel="editing = false" />
     <template v-else>
      <div class="DefinitionHeading"><ColourSwatch v-if="kind === 'belt'" :hexCode="definition.hexCode" /><span>{{ definition.name }}</span></div>
      <dl class="DefinitionDisplay">
       <div><dt>{{ t('definitionMaintenance.description') }}</dt><dd>{{ definition.description ?? '—' }}</dd></div>
       <template v-if="kind === 'belt'"><div><dt>{{ t('teams.colour') }}</dt><dd>{{ definition.hexCode ?? '—' }}</dd></div><div><dt>{{ t('definitionMaintenance.sortOrder') }}</dt><dd>{{ definition.sortOrder }}</dd></div></template>
       <div v-if="kind === 'badge'"><dt>{{ t('definitionMaintenance.category') }}</dt><dd><NuxtLink v-if="category" :to="`/mentor/maintenance/badge-categories/${category.id}`">{{ category.name }}</NuxtLink><span v-else>{{ t('definitionMaintenance.unavailableCategory') }}</span></dd></div>
       <div v-if="kind !== 'category'"><dt>{{ t('definitionMaintenance.awardedCount') }}</dt><dd>{{ definition.awardedCount }}</dd></div>
      </dl>
      <UButton class="DefinitionEdit" @click="editing = true">{{ t('definitionMaintenance.edit') }}</UButton>
     </template>
    </UPageCard>
    <UPageCard v-if="kind === 'category'" :title="t('definitionMaintenance.image')"><CategoryImageEditor :key="definition.id" :category="definition" :saving="isSaving" :change="changeImage" /></UPageCard>
    <UPageCard v-if="kind === 'category'" :title="t('nav.Badges')"><ul v-if="relatedBadges.length"><li v-for="badge in relatedBadges" :key="badge.id"><NuxtLink :to="`/mentor/maintenance/badges/${badge.id}`">{{ badge.name }}</NuxtLink></li></ul><p v-else>{{ t('definitionMaintenance.noBadges') }}</p></UPageCard>
    <UPageCard v-if="deleteSnapshot" :title="t('definitionMaintenance.deleteConfirm')">
     <p>{{ t(kind === 'category' ? 'definitionMaintenance.categoryDeleteDescription' : 'definitionMaintenance.deleteDescription') }}</p>
     <p v-if="kind !== 'category'">{{ t('definitionMaintenance.awardedCount') }}: {{ definition.awardedCount }}</p>
     <UAlert v-if="staleDelete" color="warning" :title="t('definitionMaintenance.remoteChanged')" />
     <div class="DefinitionActions"><UButton color="error" :loading="isSaving" :disabled="staleDelete || (kind === 'category' && relatedBadges.length > 0)" @click="remove">{{ t('definitionMaintenance.delete') }}</UButton><UButton variant="outline" :disabled="isSaving" @click="deleteSnapshot = null">{{ t('profile.cancel') }}</UButton></div>
    </UPageCard>
    <UButton v-else class="DefinitionEdit" color="error" variant="outline" :disabled="editing || isSaving" @click="confirmDelete">{{ t('definitionMaintenance.delete') }}</UButton>
   </template>
  </div></template>
 </UDashboardPanel>
</template>
<style scoped lang="scss">
 .DefinitionDetail { display:grid; gap:calc(var(--spacing) * 5); padding:calc(var(--spacing) * 4); max-width:70rem; }
 .DefinitionDisplay { display:grid; gap:calc(var(--spacing) * 4); } .DefinitionDisplay dt { font-weight:600; } .DefinitionDisplay dd { margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }
 .DefinitionHeading,.DefinitionActions { display:flex; align-items:center; gap:calc(var(--spacing) * 3); } .DefinitionEdit { width:fit-content; justify-self:start; }
</style>
