<script setup lang="ts">
	import type { Session } from "@supabase/gotrue-js";
	import { z } from "zod";

	const { Translate } = useTranslation();

	definePageMeta({
		layout: "auth",
	});

	const router = useRouter();
	const { LoginUsernamePass, User } = useAuthState();
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

		const loginSuccess = await LoginUsernamePass({
			username: formState.username,
			password: formState.password,
		});

		if (loginSuccess) {
			// This will continue with a redirect to the /logged_in page
			console.log("[Login] User:", User.value);
			router.replace("/logged_in");
		} else {
			errorMessage.value = "Could Not Complete Login";
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
