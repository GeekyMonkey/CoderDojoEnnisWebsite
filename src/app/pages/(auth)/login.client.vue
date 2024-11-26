<script setup lang="ts">
	import { Icon } from "@iconify/vue";
	import { computed, reactive, ref, type Ref } from "vue";
	import { z } from "zod";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
	} from "@/components/ui/card";
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import {
		type DateValue,
		getLocalTimeZone,
		today,
	} from "@internationalized/date";
	import type { Session } from "@supabase/gotrue-js";
	import { createClient, SupabaseClient } from "@supabase/supabase-js";
	import { useTeamsStore } from "~/composables/TeamsStore";

	const supabase: SupabaseClient = useSupabaseClient();

	definePageMeta({
		layout: "auth",
	});

	const TeamsShow = ref(false);
	const { TeamOptions, isLoading, isError, error } = useTeamsStore();

	const teamCount = computed<number>(() => {
		return TeamOptions.value?.length ?? 0;
	});

	const showPassword = ref(false);

	// Form Validation & State
	const formSchema = z.object({
		username: z.string().min(4, "Must be at least 4 characters"),
		password: z.string().min(4, "Must be at least 4 characters"),
	});
	type FormSchema = z.output<typeof formSchema>;
	const formState = reactive<FormSchema>({
		username: "",
		password: "",
	});

	const dt = ref(today(getLocalTimeZone())) as Ref<DateValue>;

	/** Show/Hide Password text */
	const togglePasswordVisibility = (): void => {
		showPassword.value = !showPassword.value;
	};

	const handleLogin = () => {
		// Handle login logic here
		console.log("Username:", formState.username);
		console.log("Password:", formState.password);
	};

	const bogus = async (num: number) => {
		TeamsShow.value = true;
		console.log("Bogus", num);
		const result = await $fetch<{ session: Session }>("/api/Auth/Bogus", {
			method: "POST",
			body: { bogusIndex: num },
		});
		console.log("result:", result);
		if (result) {
			console.log("JWT:", { session: result.session });

			supabase.auth.setSession(result.session);

			supabase.auth.getUser().then((user) => {
				console.log("User:", user);
			});
		}
	};
</script>

<template>
	<div class="LoginComponent flex items-center justify-center">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>{{ $t("login.title") }}</CardTitle>
				<div v-if="TeamsShow">
					<p>{{ teamCount }} Teams: {{ TeamOptions }}</p>
				</div>
			</CardHeader>
			<CardContent>
				<form @submit.prevent="handleLogin">
					<FormItem>
						<Label for="username">{{ $t("login.username") }}</Label>
						<Input
							type="text"
							id="username"
							v-model="formState.username"
							required
						/>
					</FormItem>

					<FormItem>
						<Label for="password">{{ $t("login.password") }}</Label>
						<div class="InputWithButton">
							<Input
								:type="showPassword ? 'text' : 'password'"
								id="password"
								v-model="formState.password"
								required
							/>
							<Button
								type="button"
								@click="togglePasswordVisibility"
								variant="icon"
								icon
							>
								<Icon
									:icon="
										showPassword
											? 'mdi:show'
											: 'mdi-show-outline'
									"
									class="ToggleIcon w-5 h-5"
								/>
							</Button>
						</div>
					</FormItem>

					<Button
						type="submit"
						class="w-full"
						variant="default"
						size="lg"
					>
						{{ $t("login.loginButton") }}
					</Button>
				</form>

				<div class="mt-4">
					<h2>Delete Me</h2>
					<Button @click="bogus(1)" variant="link" class="text-sm">
						{{ $t("Bogus 1") }}
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</template>

<style scoped lang="scss">
	.LoginComponent {
		flex-grow: 1;
	}
</style>
