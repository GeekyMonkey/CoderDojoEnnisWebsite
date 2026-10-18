<script setup lang="ts">
 import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
 import ImageEditor from "~/components/Images/ImageEditor.vue";
 import { useActionNotifications } from "~/composables/useActionNotifications";
 import { useMyProfileStore } from "~/stores/useMyProfileStore";
 import type { ProfileImageAction, ProfileImageSlot } from "#shared/types/ProfileImages";
 import type { MemberImageSubject } from "#shared/types/MemberPresentation";

 const props = defineProps<{ member: MemberImageSubject; canEdit: boolean; saving: boolean; changeImages: (action: ProfileImageAction) => Promise<unknown> }>();
 type ImageChange = { action: "upload"; png: string } | { action: "delete" };
 type ImageSlot = { key: ProfileImageSlot; populated: boolean; editable: boolean; change: (action: ImageChange) => Promise<void> };
 const { t } = useI18n();
 const { publish } = useActionNotifications();
 const { profile: actor } = useMyProfileStore();
 const { revision, refresh: refreshImages } = useProfileImageRevision((): string => props.member.id);
 const busySlots: Ref<Record<ProfileImageSlot, boolean>> = ref({ photo: false, avatar: false });
 const copying: Ref<boolean> = ref(false);
 const mentorView: ComputedRef<boolean> = computed((): boolean => actor.value?.isMentor === true);
 const busy: ComputedRef<boolean> = computed((): boolean => props.saving || copying.value || busySlots.value.photo || busySlots.value.avatar);
 const slots: ComputedRef<ImageSlot[]> = computed((): ImageSlot[] => {
  const order: ProfileImageSlot[] = mentorView.value ? ["photo", "avatar"] : ["avatar", "photo"];
  return order.map((key: ProfileImageSlot): ImageSlot => ({
   key,
   populated: key === "photo" ? props.member.hasPhoto : props.member.hasAvatar,
   editable: props.canEdit && (key === "avatar" || mentorView.value),
   change: async (action: ImageChange): Promise<void> => change({ ...action, slot: key }),
  }));
 });

 /** Save only permitted slot actions through the profile store. */
 async function change(action: ProfileImageAction): Promise<void> {
  if (!props.canEdit || props.saving || copying.value || action.action === "copyAvatarToPhoto") return;
  if (action.slot === "photo" && !mentorView.value) return;
  await props.changeImages(action);
  refreshImages();
 }

 /** Copy the avatar on the server without modifying the source image. */
 async function copyAvatar(): Promise<void> {
  if (!mentorView.value || !props.canEdit || !props.member.hasAvatar || busy.value) return;
  copying.value = true;
  try {
   await props.changeImages({ action: "copyAvatarToPhoto" });
   refreshImages();
   publish({ name: "profile.images.success", severity: "success", message: t("profileImages.saved") });
  } catch {
   publish({ name: "profile.images.error", severity: "error", message: t("profileImages.saveError") });
  } finally { copying.value = false; }
 }
 watch((): MemberImageSubject => props.member, (): void => { refreshImages(); });
</script>

<template>
 <section :class="['ProfileImages', { MentorView: mentorView }]" :aria-label="t('profileImages.title')">
  <div v-for="slot in slots" :key="slot.key" :class="['ImageSlot', slot.key === 'photo' ? 'PhotoSlot' : 'AvatarSlot']">
   <h3>{{ t(`profileImages.${slot.key}`) }}</h3>
   <ImageEditor :identity="`${member.id}:${slot.key}`" :label="t(`profileImages.${slot.key}`)" :populated="slot.populated" :round="slot.key === 'photo'" :canEdit="slot.editable" :saving="saving" :locked="copying" :change="slot.change" @busy="busySlots[slot.key] = $event">
    <ProfileImage v-if="slot.populated" :memberId="member.id" :slot="slot.key" :revision="revision" />
    <UIcon v-else name="i-lucide-image" class="EmptyImageIcon" />
   </ImageEditor>
  </div>
  <UButton v-if="mentorView && canEdit" class="CopyAction" type="button" icon="i-lucide-copy" variant="outline" :loading="copying" :disabled="busy || !member.hasAvatar" @click="copyAvatar">{{ t('profileImages.copyAvatarToPhoto') }}</UButton>
 </section>
</template>

<style scoped lang="scss">
 .ProfileImages { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); width: 100%; align-items: start; }
 .ImageSlot { display: grid; gap: calc(var(--spacing) * 2); min-width: 0; max-width: 100%; }
 .AvatarSlot { width: 12rem; }
 .PhotoSlot { width: 4rem; font-size: var(--text-sm); color: var(--ui-text-muted); }
 .MentorView .PhotoSlot { width: 14rem; font-size: inherit; color: inherit; }
 .MentorView .AvatarSlot { width: 8rem; }
 .ImageSlot h3 { text-align: center; }
 .CopyAction { align-self: end; max-width: 100%; white-space: normal; }
 .EmptyImageIcon { width: 2rem; height: 2rem; color: var(--ui-text-muted); }
</style>
