<script setup lang="ts">
 import { ref, type Ref } from "vue";
 import CategoryImage from "./CategoryImage.vue";
 import EntityImageEditor from "~/components/Images/EntityImageEditor.vue";
 import type { Definition } from "#shared/types/DefinitionMaintenance";
 import type { EntityImageAction } from "#shared/types/ImageUpload";
 const props = defineProps<{ category: Definition; saving: boolean; change: (action: EntityImageAction) => Promise<Definition> }>();
 const { t } = useI18n();
 const editing: Ref<boolean> = ref(false);
 /** Close image editing after the store publishes the saved category. */
 async function change(action: EntityImageAction): Promise<Definition> {
  const saved: Definition = await props.change(action);
  editing.value = false;
  return saved;
 }
</script>
<template>
 <section class="CategoryImagePanel">
  <EntityImageEditor v-if="editing" :identity="category.id" :revision="category.imageRevision" :populated="category.hasImage" :saving="saving" :change="change">
   <CategoryImage :id="category.id" :name="category.name" :populated="category.hasImage" :revision="category.imageRevision" size="large" />
  </EntityImageEditor>
  <CategoryImage v-else :id="category.id" :name="category.name" :populated="category.hasImage" :revision="category.imageRevision" size="large" />
  <UButton v-if="editing" variant="outline" :disabled="saving" @click="editing = false">{{ t('profile.cancel') }}</UButton>
  <UButton v-else variant="outline" :disabled="saving" @click="editing = true">{{ t('profileImages.edit') }}</UButton>
 </section>
</template>
<style scoped lang="scss">
 .CategoryImagePanel { display:grid; justify-items:start; gap:calc(var(--spacing) * 3); }
</style>
