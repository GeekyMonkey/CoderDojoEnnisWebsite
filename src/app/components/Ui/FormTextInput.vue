<script setup lang="ts">
	const props = defineProps<{
		label: string;
		valid?: boolean;
		validation: string;
		modelValue: string;
	}>();

	const emit = defineEmits(["update:modelValue"]);

	const inputValue = computed({
		get: () => props.modelValue,
		set: (value) => emit("update:modelValue", value),
	});
</script>

<template>
	<div :class="`UiFormTextInput valid_${valid}`">
		<label class="label">{{ label }}</label>
		<div class="InputRow">
			<input v-bind="$attrs" v-model="inputValue" />
			<slot name="right"></slot>
		</div>
		<div v-if="validation" class="help is-danger">
			{{ validation }}
		</div>
	</div>
</template>

<style lang="scss">
	@layer app {
		.UiFormTextInput {
			margin-bottom: 1rem;
			--_input-h: var(--bulma-grey-h);
			--_input-s: var(--bulma-grey-s);
			--_input-l: var(--bulma-grey-l);
			--_input-focus-h: var(--bulma-primary-h);
			--_input-focus-s: var(--bulma-primary-s);
			--_input-focus-l: var(--bulma-primary-l);
			--_input-border-h: var(--bulma-primary-h);

			&.valid_false {
				--_input-h: var(--bulma-danger-h);
				--_input-s: var(--bulma-danger-s);
				--_input-l: var(--bulma-danger-l);
				--_input-focus-h: var(--bulma-danger-h);
				--_input-focus-s: var(--bulma-danger-s);
				--_input-focus-l: var(--bulma-danger-l);
				--_input-border-l: var(--bulma-danger-l);
			}

			.InputRow {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 10px;
				display: flex;
				gap: 0.5rem;
				color: currentColor;
				border-radius: var(--input-radius);
				border-style: var(--input-border-style);
				border-width: var(--input-border-width);
				border-color: hsl(
					var(--_input-h),
					var(--_input-s),
					var(--_input-l)
				);
				background-color: hsla(
					var(--_input-h),
					var(--_input-s),
					var(--_input-l),
					0.2
				);

				input {
					width: 100%;
					background: transparent;
					border: none;
					color: hsl(
						var(--bulma-input-h),
						var(--bulma-input-s),
						var(--bulma-input-color-l)
					);
					&:focus {
						outline: none;
					}
				}
			}
		}
	}
</style>
