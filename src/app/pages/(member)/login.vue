<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>{{ $t("login.title") }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <FormItem>
            <Label for="username">{{ $t("login.username") }}</Label>
            <Input type="text" id="username" v-model="username" required />
          </FormItem>

          <FormItem>
            <Label for="password">{{ $t("login.password") }}</Label>
            <Input type="password" id="password" v-model="password" required />
          </FormItem>

          <Button type="submit" class="w-full" variant="default" size="lg">
            {{ $t("login.loginButton") }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";

const username = ref("");
const password = ref("");

const dt = ref(today(getLocalTimeZone())) as Ref<DateValue>;

const handleLogin = () => {
  // Handle login logic here
  console.log("Username:", username.value);
  console.log("Password:", password.value);
};
</script>

<style scoped lang="scss"></style>
