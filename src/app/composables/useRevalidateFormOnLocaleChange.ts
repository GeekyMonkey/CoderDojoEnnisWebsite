import { nextTick, unref, watch, type Ref } from "vue";

export type RevalidateFormOnLocaleChangeValidateOptions = Record<string, unknown>;

export type RevalidateFormOnLocaleChangeOptions = {
	/**
	 * Passed directly to the underlying form's `validate()` method.
	 * Defaults to `{ silent: true, nested: true }`.
	 */
	validateOptions?: RevalidateFormOnLocaleChangeValidateOptions;

	/** Disable/enable the watcher dynamically. */
	enabled?: boolean | Ref<boolean>;

	/** Vue watch flush timing. Defaults to `post`. */
	flush?: "pre" | "post" | "sync";
};

type ValidatableFormLike = {
	validate?: (opts?: any) => unknown | Promise<unknown>;
	formRef?: unknown;
};

const defaultValidateOptions: RevalidateFormOnLocaleChangeValidateOptions = {
	silent: true,
	nested: true,
};

function resolveValidatableForm(target: unknown): ValidatableFormLike | undefined {
	if (!target) return undefined;

	// Nuxt/Vue can expose template refs as arrays in some scenarios
	if (Array.isArray(target)) {
		return resolveValidatableForm(target[0]);
	}

	const maybe = target as ValidatableFormLike;

	// UAuthForm exposes an inner UForm via `formRef`
	if (maybe.formRef) {
		return resolveValidatableForm(maybe.formRef);
	}

	if (typeof maybe.validate === "function") return maybe;

	return undefined;
}

/**
 * Re-validates a Nuxt UI form when the i18n locale changes.
 *
 * This is useful when your Zod schema contains translated error messages (using `t()`),
 * so switching locale updates the displayed validation errors without requiring user input.
 */
export function useRevalidateFormOnLocaleChange(
	getFormTarget: () => unknown,
	options: RevalidateFormOnLocaleChangeOptions = {},
) {
	const { locale } = useI18n();

	return watch(
		() => locale.value,
		async () => {
			if (!unref(options.enabled ?? true)) return;

			// Wait for schema + UI to update for the new locale
			await nextTick();

			const form = resolveValidatableForm(getFormTarget());
			if (!form?.validate) return;

			try {
				await form.validate(options.validateOptions ?? defaultValidateOptions);
			} catch {
				// Validation can throw depending on the implementation; ignore here.
			}
		},
		{ flush: options.flush ?? "post" },
	);
}
