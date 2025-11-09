<script setup lang="ts">
import type { Session } from "@supabase/gotrue-js";
import { z } from "zod";
import SessionStats from "~/components/Attendance/SessionStats.vue";

definePageMeta({
	layout: "default",
});

const router = useRouter();
const { supabaseClient } = UseSupabaseClient();
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);
const log = useLogger("mentor/SignIn");

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
		ApiResponse<{
			session: Session;
			member: MemberModel;
			memberAttendanceCount: number;
			message: string;
		} | null>
	>("/api/MemberAttendance/SignIn", {
		method: "POST",
		body: {
			username: formState.username,
			password: formState.password,
		},
	});
	log.info("[SignIn] result:", result);
	if (result.success) {
		// Clear the form for the next member
		formState.username = "";
		formState.password = "";

		// Display the welcome message
		const message: string = result.data?.message || "Welcome!";
		alert(message); // ToDo: Replace with a nicer UI element
	} else if (result.error) {
		log.error("[Login] Error:", result.error);
		errorMessage.value = result.error || "Could Not Complete Login";
	}
};
</script>


<template>
	<div class="LoginPage">
		<div>
			<div>
				<h1>
					<Translated t="signIn.title" />
				</h1>
			</div>
			<div>
				<form @submit.prevent="handleLogin">
					<div>
						<label for="username">
							<Translated t="login.username" />
						</label>
						<input type="text" id="username" v-model="formState.username" required
							@keypress="clearErrorMessage()" />
					</div>

					<div>
						<label for="password">
							<Translated t="login.password" />
						</label>
						<div>
							<input :type="showPassword ? 'text' : 'password'" id="password" v-model="formState.password"
								required @keypress="clearErrorMessage()" />
							<UButton type="button" @click="togglePasswordVisibility">
								<NuxtIcon :name="showPassword
									? 'mdi:show'
									: 'mdi-show-outline'" />
							</UButton>
						</div>
					</div>

					<UButton type="submit">
						{{ $t("signIn.signInButton") }}
					</UButton>

					<div v-if="errorMessage">
						{{ errorMessage }}
					</div>
				</form>
			</div>
		</div>
		<div>
			<SessionStats />
		</div>
	</div>
</template>

<style scoped lang="scss">
.LoginPage {
	flex-grow: 1;
	padding: 1rem;
}
</style>
