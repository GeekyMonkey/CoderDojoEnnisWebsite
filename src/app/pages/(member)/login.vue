<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>CoderDojo Ennis Member Login</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- <Form
          v-slot="{ setFieldValue }"
          :validation-schema="accountFormSchema"
          class="space-y-8"
          @submit="onSubmit"
        >
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Your name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in
                emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </Form> -->

        <form @submit.prevent="handleLogin">
          <FormItem>
            <Label for="username">Username</Label>
            <Input type="text" id="username" v-model="username" required />
          </FormItem>

          <FormItem>
            <Label for="password">Password</Label>
            <Input type="password" id="password" v-model="password" required />
          </FormItem>

          <Calendar
            v-model="dt"
            :weekday-format="'short'"
            class="rounded-md border"
          />

          <Button type="submit" class="w-full" variant="default" size="lg">
            Login
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
