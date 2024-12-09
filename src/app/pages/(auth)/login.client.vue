<script setup lang="ts">
	import { Icon } from "@iconify/vue";
	import { computed, reactive, ref, watch, type Ref } from "vue";
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
	import type { Session } from "@supabase/gotrue-js";
	import type { ApiResponse, MemberModel } from "~~/shared/types";
	import { useRouter } from "nuxt/app";
	import { Alert } from "@/components/ui/alert";
	import { UseSupabaseClient } from "~/composables/UseSupabaseClient";

	definePageMeta({
		layout: "auth",
	});

	const router = useRouter();
	const { supabaseClient } = UseSupabaseClient();
	const showPassword = ref(false);
	const errorMessage = ref<string | null>(null);

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

	/** Show/Hide Password text */
	const togglePasswordVisibility = (): void => {
		showPassword.value = !showPassword.value;
	};

	/** Clear the error message when changing inputs */
	const clearErrorMessage = () => {
		errorMessage.value = null;
	};

	/** When formState values change, clear the error message */
	watch(formState, () => {
		clearErrorMessage();
	});

	/** Handle Login */
	const handleLogin = async () => {
		clearErrorMessage();

		const result = await $fetch<
			ApiResponse<{ session: Session; member: MemberModel }>
		>("/api/Auth/Login", {
			method: "POST",
			body: {
				username: formState.username,
				password: formState.password,
			},
		});
		console.log("[Login] result:", result);
		if (result.success) {
			// console.log("JWT:", { session: result.data.session });
			await supabaseClient.auth.setSession(result.data.session);

			// todo - save member and session in the store

			// Redirect to appropriate page
			const member: MemberModel | null = result.data.member;
			let newRoute: string;
			if (member.isMentor) {
				newRoute = "/mentor";
			} else if (member.isParent) {
				newRoute = "/parent";
			} else {
				newRoute = "/coder";
			}
			console.log("[Login] Redirecting to:", newRoute);
			router.push(newRoute);
		} else if (result.error) {
			console.error("[Login] Error:", result.error);
			errorMessage.value = result.error || "Could Not Complete Login";
		}
	};
</script>

<template>
	<div class="LoginComponent flex items-center justify-center">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>
					<Translated t="login.title" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form @submit.prevent="handleLogin">
					<FormItem>
						<Label for="username">
							<Translated t="login.username" />
						</Label>
						<Input
							type="text"
							id="username"
							v-model="formState.username"
							required
							@onkeypress="clearErrorMessage()"
						/>
					</FormItem>

					<FormItem>
						<Label for="password">
							<Translated t="login.password" />
						</Label>
						<div class="InputWithButton">
							<Input
								:type="showPassword ? 'text' : 'password'"
								id="password"
								v-model="formState.password"
								required
								@onkeypress="clearErrorMessage()"
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

					<div v-if="errorMessage" class="mt-2">
						<Alert variant="destructive">
							{{ errorMessage }}
						</Alert>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
</template>

<style scoped lang="scss">
	.LoginComponent {
		flex-grow: 1;
	}
</style>
