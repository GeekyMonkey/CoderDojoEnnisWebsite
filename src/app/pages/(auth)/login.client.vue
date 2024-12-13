<script setup lang="ts">
	import { Icon } from "@iconify/vue";
	import type { Session } from "@supabase/gotrue-js";
	import { z } from "zod";

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

	/**
	 * Handle Login
	 */
	const handleLogin = async () => {
		clearErrorMessage();

		const result = await $fetch<
			ApiResponse<{ session: Session; member: MemberModel }>
		>("/api/Auth/Login", {
			method: "POST",
			body: {
				username: formState.username,
				password: formState.password,
				credentials: "include", // Ensure cookies are included in the request
			},
		});
		console.log("[Login] result:", result);
		if (result.success) {
			// console.log("JWT:", { session: result.data.session });
			const authResponse = await supabaseClient.auth.setSession(
				result.data.session,
			);
			console.log("[Login] Auth Response:", authResponse);

			const userRef = useSupabaseUser();
			const user = await waitForRefValue(userRef, 5000);

			if (!!user) {
				// todo - save member and session in the store?
				// This will continue with a redirect to the /logged_in page
				console.log("[Login] User:", user);
				router.replace("/logged_in");
			} else {
				errorMessage.value = "Could Not Complete Login";
			}
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
