<script setup lang="ts">
import { computed, type ComputedRef } from "vue";
import { usePublicDirectoryStore, type PublicDirectoryEntry as DirectoryEntry } from "~/stores/public/usePublicDirectoryStore";
import PublicDirectoryEntry from "./PublicDirectoryEntry.vue";
type DirectorySection = { title: string; entries: DirectoryEntry[]; emptyText: string };
const directory: ReturnType<typeof usePublicDirectoryStore> = usePublicDirectoryStore();
const { data, isPending, isFetching, isError, refetch }: ReturnType<typeof usePublicDirectoryStore> = directory;
const sections: ComputedRef<DirectorySection[]> = computed<DirectorySection[]>(() => [
  { title: "Coders", entries: data.value?.Members ?? [], emptyText: "No coder project pages are shared yet." },
  { title: "Mentors", entries: data.value?.Mentors ?? [], emptyText: "No mentor project pages are shared yet." },
]);
const projectCount: ComputedRef<number> = computed<number>(() => (data.value?.Members.length ?? 0) + (data.value?.Mentors.length ?? 0));
const status: ComputedRef<string> = computed<string>(() => {
  if (isError.value) return data.value ? "Projects couldn’t be refreshed. Showing the last loaded projects." : "Projects couldn’t be loaded. Please try again.";
  if (isPending.value) return "Loading projects…";
  if (isFetching.value) return "Refreshing projects…";
  return projectCount.value ? `${projectCount.value} project ${projectCount.value === 1 ? "page" : "pages"} to explore.` : "No project pages are shared yet. Check back for new ideas.";
});
// Retry through the store while preserving any previously loaded directory.
function retry(): void { void refetch(); }
</script>
<template>
  <section class="directory" aria-label="Public project directory" :aria-busy="isFetching">
    <p class="notice" role="status" aria-live="polite">{{ status }}</p>
    <button v-if="isError" class="button button-outline" type="button" :disabled="isFetching" @click="retry">Try again</button>
    <section v-if="data" class="content-grid">
      <article v-for="section in sections" :key="section.title">
        <h2>{{ section.title }}</h2>
        <ul v-if="section.entries.length" class="project-list" :aria-label="`${section.title} project pages`">
          <PublicDirectoryEntry v-for="entry in section.entries" :key="entry.GithubLogin" :entry="entry" />
        </ul>
        <p v-else>{{ section.emptyText }}</p>
      </article>
    </section>
  </section>
</template>
