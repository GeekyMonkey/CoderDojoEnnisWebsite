<script setup lang="ts">
	import type { Session } from "@supabase/gotrue-js";
	import { z } from "zod";

	const { Translate } = useTranslation();

	definePageMeta({
		layout: "auth",
	});

	const router = useRouter();
	const { supabaseClient } = useSupabase();
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
	<div class="LoginComponent">
		<UiCard class="is-primary">
			<template #heading>
				<Translated t="login.title" />
			</template>

			<form id="LoginForm" @submit.prevent="handleLogin">
				<UiFormTextInput
					:label="Translate('login.username')"
					type="text"
					id="username"
					v-model="formState.username"
					required
					@onkeypress="clearErrorMessage()"
					validation="This login is invalid"
				>
				</UiFormTextInput>

				<UiFormTextInput
					:label="Translate('login.password')"
					:type="showPassword ? 'text' : 'password'"
					id="password"
					v-model="formState.password"
					required
					@onkeypress="clearErrorMessage()"
					:valid="true"
					validation="This password is invalid"
				>
					<template #right>
						<UiIcon
							class="is-small clickable"
							:icon="
								showPassword ? 'mdi:show' : 'mdi-show-outline'
							"
							@click="togglePasswordVisibility"
						></UiIcon>
					</template>
				</UiFormTextInput>
			</form>

			pw={{ formState.password }}

			<template #footer>
				<div class="buttons" style="width: 100%">
					<UiButton type="submit" form="LoginForm" class="is-primary">
						{{ $t("login.loginButton") }}
					</UiButton>
				</div>
				<div v-if="errorMessage">
					<div class="notification is-danger is-width-full">
						{{ errorMessage }}
					</div>
				</div>
			</template>
		</UiCard>
	</div>
</template>

<style scoped lang="scss">
	.LoginComponent {
	}
</style>
