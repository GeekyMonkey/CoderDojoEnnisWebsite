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
	const usernameInput = ref<unknown>(null);
	const signInResponse = shallowRef<AttendanceSignInResponseModel | null>(null);
	const showSignInNotifications = ref(false);

	useRevalidateFormOnLocaleChange(() => signInForm.value);

	type FormSchema = {
		username: string;
		password: string;
	};

	const formSchema = computed(() =>
		z.object({
			username: z.string().min(4, t("validation.minLength", { min: 4 })),
			password: z.string().min(4, t("validation.minLength", { min: 4 })),
		}),
	);

	const formState = reactive<FormSchema>({
		username: "",
		password: "",
	});

	const clearErrorMessage = () => {
		errorMessage.value = null;
	};

	watch(() => [formState.username, formState.password], () => {
		clearErrorMessage();
	});

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

	const focusUsername = async () => {
		if (!process.client) return;
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

	const handleSignIn = async (username: string, password: string) => {
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

	const onSubmit = async (event: FormSubmitEvent<FormSchema>) => {
		await handleSignIn(event.data.username, event.data.password);
	};
</script>

<template>
	<div class="SignInPage">
		<div class="SignInPageGrid">
			<UPageCard class="SignInCard">
				<UForm
					ref="signInForm"
					:state="formState"
					:schema="formSchema"
					@submit="onSubmit"
					class="SignInForm"
				>
					<header class="SignInHeader">
						<h1 class="SignInTitle">
							<Translated t="signIn.title" />
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

			<UPageCard
				v-if="showSignInNotifications && signInResponse"
			>
				<UAlert
					class="WelcomePanel"
					color="success"
					icon="i-lucide-smile"
				>

					<template #description>
						<div class="WelcomeStats">
							<div class="WelcomeLine">
								<strong>{{ signInResponse.memberName }}</strong>
								- {{ signInResponse.memberSessionCount }} sessions
							</div>

							<div
								v-if="signInResponse.notifications?.length"
								class="NotificationsList"
							>
								<ul class="BulletList">
									<li
										v-for="(n, idx) in signInResponse.notifications"
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

<style scoped lang="css">
	.SignInPage {
		width: 100%;
	}

	.SignInPageGrid {
		display: flex;
		gap: calc(var(--spacing) * 6);
		align-items: flex-start;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.SignInCard {
		width: 100%;
		max-width: 28rem;
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
		font-size: 1.5rem;
		line-height: 1.9rem;
		font-weight: 700;
	}

	.WelcomePanel {
		margin-top: calc(var(--spacing) * 4);
	}

	.WelcomeStats {
		display: grid;
		gap: calc(var(--spacing) * 1);
	}

	.WelcomeLine {
		font-weight: 600;
	}

	.NotificationsList {
		margin-top: calc(var(--spacing) * 2);
	}

	.NotificationsList ul {
		margin: 0;
		padding-left: 1.1rem;
	}
</style>
