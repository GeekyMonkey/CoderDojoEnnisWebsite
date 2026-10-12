<script setup lang="ts">
 import { computed, type ComputedRef } from "vue";
 import type { BeltModel } from "#shared/types/models/BeltModel";
 import type { PublicAward } from "#shared/types/Coder";
 import { profileIdentitySchema } from "#shared/types/MemberProfile";
 import { useMemberQuery } from "~/stores/useMemberQuery";
 import {teamMemberProfileSchema} from "#shared/types/Coder";
 import PublicProfileDetails from "~/components/Profile/PublicProfileDetails.vue";
 import PublicAwards from "~/components/Achievements/PublicAwards.vue";
 import TeamRoster from "~/components/Teams/TeamRoster.vue";
 const props = defineProps<{role:"Coder"|"Parent"}>();
 const route:ReturnType<typeof useRoute> = useRoute();
 const {t} = useI18n();
 const id:ComputedRef<string> = computed(():string=>typeof (route.params as Record<string,string|string[]>).memberId==="string"?String((route.params as Record<string,string|string[]>).memberId):"");
 const valid:ComputedRef<boolean> = computed(():boolean=>profileIdentitySchema.safeParse(id.value).success);
 const {data,isPending,isError} = useMemberQuery(():string|null=>valid.value?`team-members/${id.value}`:null,teamMemberProfileSchema,false,props.role);
 const currentBelt:ComputedRef<BeltModel|null> = computed(():BeltModel|null=>[...(data.value?.awards??[])].filter((award:PublicAward):boolean=>award.kind==="belt").sort((a:PublicAward,b:PublicAward):number=>(b.awarded??0)-(a.awarded??0))[0]?.belt??null);
</script>
<template><UDashboardPanel :id="`${role.toLowerCase()}-team-member`"><template #header><DashboardHeading :pageTitle="`${data?.member.nameFirst ?? ''} ${data?.member.nameLast ?? ''}`" :breadcrumbLabel="t(role==='Parent'?'nav.My Kids':'profile.title')" :breadcrumbTo="role==='Parent'?'/parent/kids':'/coder/profile'" /></template><template #body><div class="TeamMember"><UAlert v-if="!valid || isError" color="error" :title="t('profile.loadError')" /><p v-else-if="isPending">{{ t('profile.loading') }}</p><template v-else-if="data"><PublicProfileDetails :member="data.member" :currentBelt="currentBelt" /><TeamRoster :team="data.team" :members="data.roster" :profileBase="`/${role.toLowerCase()}/team-members`" /><PublicAwards :awards="data.awards" /></template></div></template></UDashboardPanel></template>
<style scoped lang="scss">.TeamMember { display:grid; gap:calc(var(--spacing)*5); padding:calc(var(--spacing)*4); max-width:60rem; }</style>
