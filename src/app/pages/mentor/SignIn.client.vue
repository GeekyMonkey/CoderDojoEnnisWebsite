<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { Session } from "@supabase/gotrue-js";
import { z } from "zod";
import SessionStats from "~/components/Attendance/SessionStats.vue";

definePageMeta({
	layout: "stats",
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
	console.log("[SignIn] result:", result);
	if (result.success) {
		// Clear the form for the next member
		formState.username = "";
		formState.password = "";

		// Display the welcome message
		const message: string = result.data?.message || "Welcome!";
		alert(message); // ToDo: Replace with a nicer UI element
	} else if (result.error) {
		console.error("[Login] Error:", result.error);
		errorMessage.value = result.error || "Could Not Complete Login";
	}
};
</script>


<template>
	<div class="LoginPage flex flex-col md:flex-row gap-6 items-start justify-center w-full">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>
					<Translated t="signIn.title" />
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
						{{ $t("signIn.signInButton") }}
					</Button>

					<div v-if="errorMessage" class="mt-2">
						<Alert variant="destructive">
							{{ errorMessage }}
						</Alert>
					</div>
				</form>
			</CardContent>
		</Card>
		<div class="w-full max-w-md">
			<SessionStats />
		</div>
	</div>
</template>

<style scoped lang="scss">
    .LoginPage { flex-grow:1; padding: 1rem; }
</style>
