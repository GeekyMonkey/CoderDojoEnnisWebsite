<script setup lang="ts">
	import type { ComponentPublicInstance } from "vue";
	import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";
	import { useAuthStore } from "~/stores/useAuthStore";

	type FormSchema = {
		username: string;
		password: string;
	};

	type AuthFormExpose = {
		state?: Partial<FormSchema>;
		formRef?: unknown;
	};

	const router = useRouter();
	const { t } = useI18n();
	const log = useLogger("auth/login");
	const { supabaseClient } = UseSupabaseClient();
	const { login, loginWithNfc } = useAuthStore();
	const errorMessage = ref<string | null>(null);
	const authForm = ref<(ComponentPublicInstance & AuthFormExpose) | null>(null);
	const isSubmitting = ref(false);

	/**
	 * Form Validation (localized)
	 */
	const formSchema = computed(() =>
		z.object({
			username: z.string().min(4, t("validation.minLength", { min: 4 })),
			password: z.string().min(4, t("validation.minLength", { min: 4 })),
		}),
	);

	/**
	 * Form Fields
	 */
	const fields = computed<AuthFormField[]>(() => [
		{
			name: "username",
			type: "text",
			label: t("login.username"),
			required: true,
			defaultValue: "",
			autocomplete: "username",
		},
		{
			name: "password",
			type: "password",
			label: t("login.password"),
			required: true,
			defaultValue: "",
			autocomplete: "current-password",
		},
	]);

	/**
	 * Clear the error message when changing inputs
	 */
	const clearErrorMessage = () => {
		errorMessage.value = null;
	};

	/**
	 * Complete login and redirect
	 */
	const completeLogin = async (result: ApiResponse<{ session: any; member: any }>) => {
		if (result.success) {
			const authResponse = await supabaseClient.auth.setSession(
				result.data.session,
			);
			log.info("[Login] Auth Response:", authResponse);

			const userRef = useSupabaseUser();
			const user = await waitForRefValue(userRef, 5000);

			if (user) {
				log.info("[Login] User:", { user: user.value });
				router.replace("/logged_in");
			} else {
				errorMessage.value = "Could Not Complete Login";
			}
		} else if (result.error) {
			log.error("[Login] Error:", { error: result.error });
			errorMessage.value = result.error || "Could Not Complete Login";
		}
	};

	/**
	 * Handle Login
	 */
	const handleLogin = async (event: FormSubmitEvent<FormSchema>) => {
		const { username, password } = event.data;
		
		clearErrorMessage();
		isSubmitting.value = true;

		try {
			const result = await login(username, password);
			log.info("[Login] result:", result);
			await completeLogin(result);
		} finally {
			isSubmitting.value = false;
		}
	};

	/**
	 * Handle NFC message
	 */
	const handleNfcMessage: NfcMessageCallback = async ({ serialNumber, message }): Promise<void> => {
		log.info("NFC tag detected", { serialNumber, message });

		clearErrorMessage();
		isSubmitting.value = true;
		try {
			const result = await loginWithNfc(serialNumber);
			log.info("[Login][NFC] result:", result);
			await completeLogin(result);
		} catch (err) {
			log.error("[Login][NFC] Error:", { error: err });
			errorMessage.value = t("login.nfcErrorFallback");
		} finally {
			isSubmitting.value = false;
		}
	};

	/**
	 * Handle NFC error
	 */
	const handleNfcError: NfcErrorCallback = async (error): Promise<void> => {
		log.error("NFC Error", { error });
		errorMessage.value = `NFC Error: ${error}`;
	};

	// -- Watchers --

	useRevalidateFormOnLocaleChange(() => authForm.value);

	/**
	 * Watch for input changes to clear error message
	 */
	watch(
		() => [authForm.value?.state?.username, authForm.value?.state?.password],
		() => {
			clearErrorMessage();
		},
	);

</script>

<template>
	<UPageCard class="w-full max-w-md">
		<UAuthForm
			ref="authForm"
			:fields="fields"
			:schema="formSchema"
			:title="t('login.title')"
			icon="i-lucide-lock"
			:submit="{ label: t('login.loginButton') }"
			@submit="handleLogin"
		>
			<template #header>
				<CoderDojoLogo size="md" class="mx-auto mb-4" />
				<h1>{{ t('login.title') }}</h1>
			</template>

			<template #validation>
				<UAlert
					v-if="errorMessage"
					color="error"
					icon="i-lucide-info"
					:title="errorMessage"
				/>
			</template>

			<template #footer>
				<div class="flex items-center gap-2 justify-end">
					<NfcToggle
						@message="handleNfcMessage"
						@error="handleNfcError"
					/>
				</div>
			</template>
		</UAuthForm>
	</UPageCard>
</template>
