import { ref, type Ref } from "vue";
import { requestFailureFields } from "#shared/utils/RequestFailure";
import type { ValidationFieldError } from "#shared/utils/ValidationErrors";

type ValidationForm = { setErrors: (errors: ValidationFieldError[]) => void };
type RequestValidation = { validationForm: Ref<ValidationForm | null>; showValidationErrors: (failure: unknown) => void };

/** Connect server validation failures to Nuxt UI's inline form errors. */
export function useRequestValidation(): RequestValidation {
	const validationForm: Ref<ValidationForm | null> = ref(null);
	/** Show validation reasons beside their corresponding inputs. */
	function showValidationErrors(failure: unknown): void {
		validationForm.value?.setErrors(requestFailureFields(failure));
	}
	return { validationForm, showValidationErrors };
}
