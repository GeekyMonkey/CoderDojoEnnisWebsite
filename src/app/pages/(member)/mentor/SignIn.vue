<script setup lang="ts">
	import { nextTick } from "vue";
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";
	import { useMemberAttendanceStore } from "~/stores/useMemberAttendanceStore";
	import type { AttendanceSignInResponseModel } from "~~/shared/types/AttendanceModels";

	definePageMeta({
		layout: "auth-layout",
	});

	const { t } = useI18n();
	const log = useLogger("mentor/SignIn");
	const { signInMember } = useMemberAttendanceStore();

	const errorMessage = ref<string | null>(null);
	const isSubmitting = ref(false);
	const signInForm = ref<unknown>(null);
	const signInResponse = shallowRef<AttendanceSignInResponseModel | null>(null);
	const showSignInNotifications = ref(false);

	/**
	 * Form Schema Type
	 */
	type FormSchema = {
		username: string;
		password: string;
	};

	/**
	 * Form Validation (localized)
	 */
	const formSchemaValidation = computed(() =>
		z.object({
			username: z.string().min(4, t("validation.minLength", { min: 4 })),
			password: z.string().min(4, t("validation.minLength", { min: 4 })),
		}),
	);

	/**
	 * Form State
	 */
	const formState = reactive<FormSchema>({
		username: "",
		password: "",
	});

	/**
	 * Clear the error message
	 */
	const clearErrorMessage = () => {
		errorMessage.value = null;
	};

	/**
	 * Focus the username input field
	 * (Why is this so hard to get right???)
	 */
	const focusUsername = async () => {
		if (!process.client) {
			return;
		}

		// Two ticks + rAF to avoid focusing a DOM node that is about to be replaced
		// by reactive updates (UInput/UForm validation + v-model clears).
		await nextTick();
		await nextTick();
		await new Promise<void>((resolve) =>
			(globalThis as any).requestAnimationFrame?.(() => resolve()) ?? resolve(),
		);

		const doc = (globalThis as any).document;
		if (doc) {
			const inputEl = doc.querySelector?.('input');
			if (inputEl) {
				inputEl.focus();
				inputEl.select();

				// Debug: if something steals focus right after submit, this often wins
				(globalThis as any).setTimeout(() => {
					inputEl.focus();
					try {
						console.log("[SignIn] focusUsername after timeout active:", doc?.activeElement);
					} catch {
						// ignore
					}
				}, 0);
			}
		}
	};

	/**
	 * Notifications to display to signed in member (excluding greeting)
	 */
	const notifications = computed(() => {
		return (signInResponse.value?.notifications || [])
			.filter(n => n.type !== "GREETING");
	});

	/** 
	 * Handle Form Submit
	 */
	const handleSignIn = async (event: FormSubmitEvent<FormSchema>) => {
		const { username, password } = event.data;
		
		clearErrorMessage();
		isSubmitting.value = true;
		try {
			const result = await signInMember({ username, password });

			log.info("[SignIn] result:", result);
			if (result.success) {
				signInResponse.value = result.data;
				showSignInNotifications.value = true;

				// Clear the form for the next member
				formState.username = "";
				formState.password = "";
				// The username input is disabled while isSubmitting is true.
				// Clear it early so focus works immediately for the next member.
				isSubmitting.value = false;
				await focusUsername();
				return;
			}
			errorMessage.value = result.error || "Could Not Complete Sign In";
		} catch (err) {
			const message: string = ErrorToString(err);
			log.error("[SignIn] POST error", undefined, err);
			errorMessage.value = message;
		} finally {
			isSubmitting.value = false;
		}
	};

		/**
	 * Session Count Message displayed for signed in member
	 */
	const sessionCountMessage = computed(() => {
		if (!signInResponse.value) {
			return "";
		}
		const count: number = signInResponse.value.memberSessionCount;
		return t("signIn.sessionCount", count, { count });
	});

	/**
	 * Revalidate form on language change to update validation messages
	 */
	useRevalidateFormOnLocaleChange(() => signInForm.value);

	// -- Watchers --

	/**
	 * Clear error message on input change
	 */
	watch(() => [formState.username, formState.password], () => {
		clearErrorMessage();
	});

	/**
	 * Hide sign-in notifications when username input begins
	 * being filled in (typing/paste/autofill)
	 */
	watch(
		() => formState.username,
		(next, prev) => {
			// Keep notifications visible after success until the next member begins
			// entering a username (typing/paste/autofill): "" -> non-empty
			if (showSignInNotifications.value && prev === "" && next !== "") {
				showSignInNotifications.value = false;
			}
		},
	);

</script>

<template>
	<div class="SignInPage">
		<div class="SignInPageGrid">
			<UPageCard class="SignInCard">
				<UForm
					ref="signInForm"
					:state="formState"
					:schema="formSchemaValidation"
					@submit="handleSignIn"
					class="SignInForm"
				>
					<header class="SignInHeader">
						<h1 class="SignInTitle">
							<Translated t="signIn.title" />
							<CoderDojoLogo size="md" />
						</h1>
					</header>

					<UFormField name="username" :label="t('login.username')">
						<UInput
							ref="usernameInput"
							v-model="formState.username"
							:disabled="isSubmitting"
						/>
					</UFormField>

					<UFormField name="password" :label="t('login.password')">
						<UInput
							v-model="formState.password"
							type="password"
							:disabled="isSubmitting"
						/>
					</UFormField>

					<UAlert
						v-if="errorMessage"
						color="error"
						icon="i-lucide-info"
						:title="errorMessage"
					/>

					<UButton
						type="submit"
						block
						:loading="isSubmitting"
					>
						{{ t("signIn.signInButton") }}
					</UButton>
				</UForm>
			</UPageCard>

			<UPageCard :class="`WelcomeCard WelcomeVisible_${showSignInNotifications}`">
				<UAlert
					v-if="signInResponse"
					class="WelcomePanel"
					color="success"
				>

					<template #description>
						<div class="WelcomeStats">
							<div class="WelcomeLine">
								<MemberAvatar
									:member="signInResponse.memberDetails"
									size="lg"
								/>
								<div class="MemberName">
									{{ signInResponse.memberName }}
								</div>
								{{ sessionCountMessage }}
							</div>

							<MemberBelt :member="signInResponse.memberDetails" />

							<TeamCard :for="signInResponse.memberDetails"
								size="md"
							/>

							<div
								v-if="signInResponse.notifications?.length"
								class="NotificationsList"
							>
								<ul class="BulletList">
									<li
										v-for="(n, idx) in notifications"
										:key="idx"
									>
										{{ n.message }}
									</li>
								</ul>
							</div>
						</div>
					</template>
				</UAlert>
			</UPageCard>
		</div>
	</div>
</template>

<style lang="css">
	.SignInPage {
		width: 100%;
	  

	.SignInPageGrid {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
		gap: 2rem;
		justify-content: center;
	}

	.SignInCard {
		width: 100%;
		max-width: 500px;
	}

	.SignInForm {
		display: grid;
		gap: calc(var(--spacing) * 4);
	}

	.SignInHeader {
		display: grid;
		gap: calc(var(--spacing) * 1);
	}

	.SignInTitle {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 2);
		font-size: 1.5rem;
		line-height: 1.9rem;
		font-weight: 700;
	}

	.WelcomeCard {
		box-shadow: none;
		border: none;
		width: 100%;
		max-width: 250px;
		opacity: 1;
		transition: all 0.3s ease-in-out;

		> [data-slot="container"] {
			padding: 0;
		}
		
		.WelcomePanel {
			margin-top: 0;
			transition: all 0.3s ease-in-out;
		}

		&.WelcomeVisible_false {
			opacity: 0;

			.WelcomePanel {
				scale: 0.5;
			}
		}
	}

	.WelcomeStats {
		display: grid;
		gap: calc(var(--spacing) * 1);
	}

	.WelcomeLine {
		font-weight: 600;

		.MemberAvatar {
			display: block;
			margin: 0 auto;
		}

		.MemberName {
			font-size: 1.2rem;
		}
	}

	.NotificationsList {
		margin-top: calc(var(--spacing) * 2);
	}

	.NotificationsList ul {
		margin: 0;
		padding-left: 1.1rem;
	}
}
</style>
