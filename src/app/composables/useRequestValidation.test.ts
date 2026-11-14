import { describe, expect, it, vi } from "vitest";
import { useRequestValidation } from "./useRequestValidation";

describe("inline request validation", (): void => {
	it("assigns server errors to Nuxt UI field names", (): void => {
		const validation: ReturnType<typeof useRequestValidation> = useRequestValidation();
		const setErrors: ReturnType<typeof vi.fn> = vi.fn();
		validation.validationForm.value = { setErrors };
		validation.showValidationErrors({ data: { data: { validationErrors: [{ name: "fields.birthYear", message: "Birth year cannot be in the future" }] } } });
		expect(setErrors).toHaveBeenCalledWith([{ name: "birthYear", message: "Birth year cannot be in the future" }]);
	});
});
