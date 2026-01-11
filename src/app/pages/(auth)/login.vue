<script setup lang="ts">
	import type { ComponentPublicInstance } from "vue";
	import type { Session } from "@supabase/supabase-js";
	import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	definePageMeta({
		layout: "auth-layout",
	});

	const router = useRouter();
	const { t } = useI18n();
	const { supabaseClient } = UseSupabaseClient();
	const errorMessage = ref<string | null>(null);

	type FormSchema = {
		username: string;
		password: string;
	};

	// Form Validation (localized)
	const formSchema = computed(() =>
		z.object({
			username: z.string().min(4, t("validation.minLength", { min: 4 })),
			password: z.string().min(4, t("validation.minLength", { min: 4 })),
		}),
	);

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

	/** Clear the error message when changing inputs */
	const clearErrorMessage = () => {
		errorMessage.value = null;
	};

	type AuthFormExpose = {
		state?: Partial<FormSchema>;
		formRef?: unknown;
	};

	const authForm = ref<(ComponentPublicInstance & AuthFormExpose) | null>(null);

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

	/**
	 * Handle Login
	 */
	const handleLogin = async (username: string, password: string) => {
		clearErrorMessage();

		const result = await $fetch<
			ApiResponse<{ session: Session; member: MemberModel }>
		>("/api/Auth/Login", {
			method: "POST",
			body: {
				username,
				password,
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

	const onSubmit = async (event: FormSubmitEvent<FormSchema>) => {
		await handleLogin(event.data.username, event.data.password);
	};
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
			@submit="onSubmit"
		>
			<template #validation>
				<UAlert
					v-if="errorMessage"
					color="error"
					icon="i-lucide-info"
					:title="errorMessage"
				/>
			</template>
		</UAuthForm>
	</UPageCard>
</template>
