<script setup lang="ts">
	import type { Session } from "@supabase/supabase-js";
	import { z } from "zod";

	definePageMeta({
		layout: "auth-layout",
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

			if (user) {
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
	<div class="LoginComponent">
		<div>
			<div>
				<h1>
					<Translated t="login.title"/>
				</h1>
			</div>
			<form @submit.prevent="handleLogin">
				<div>
					<label for="username">
						<Translated t="login.username"/>
					</label>
					<input
						type="text"
						id="username"
						v-model="formState.username"
						required
						@keypress="clearErrorMessage()"
					>
				</div>

				<div>
					<label for="password">
						<Translated t="login.password"/>
					</label>
					<div>
						<input
							:type="showPassword ? 'text' : 'password'"
							id="password"
							v-model="formState.password"
							required
							@keypress="clearErrorMessage()"
						>
						<UButton @click="togglePasswordVisibility">
							<NuxtIcon
								:name="showPassword
									? 'mdi:show'
									: 'mdi-show-outline'"
							/>
						</UButton>
					</div>
				</div>

				<UButton type="submit">{{ $t("login.loginButton") }}</UButton>

				<div v-if="errorMessage">{{ errorMessage }}</div>
			</form>
		</div>
	</div>
</template>

<style scoped lang="css">
	.LoginComponent {
	}
</style>
