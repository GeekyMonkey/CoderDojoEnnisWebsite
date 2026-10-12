<script setup lang="ts">
 import {computed,type ComputedRef} from "vue";
 import ChildPage from "~/components/Parent/ChildPage.vue";
 const route:ReturnType<typeof useRoute> = useRoute();
 const id:ComputedRef<string> = computed(():string=>{const params:Record<string,string|string[]> = route.params;return typeof params.memberId==="string"?params.memberId:"";});
</script>
<template><ChildPage :memberId="id" section="attendance" /></template>
