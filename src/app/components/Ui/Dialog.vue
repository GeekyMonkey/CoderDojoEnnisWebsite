<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			closeButton?: boolean;
			icon?: string;
			title?: string;
		}>(),
		{
			closeButton: true,
			icon: "",
			title: "",
		},
	);

	/** Is the dialog visible */
	const isOpen = ref(false);
	const slots = useSlots();

	/** Does the dialog have a heading slot */
	const hasHeadingSlot = computed<boolean>(() => !!slots.heading);
	const hasFooterSlot = computed<boolean>(() => !!slots.footer);

	/** Is there a top close button */
	const showTopCloseButton = computed<boolean>(
		() => props.closeButton && !hasHeadingSlot.value,
	);

	/** Is there a heading close button */
	const showHeadingCloseButton = computed<boolean>(
		() => props.closeButton && hasHeadingSlot.value,
	);

	/** Close the dialog */
	const close = (): void => {
		isOpen.value = false;
	};

	/** Open the dialog */
	const open = (): void => {
		isOpen.value = true;
	};

	/** Toggle the dialog open or closed */
	const toggle = (): void => {
		isOpen.value = !isOpen.value;
	};

	onMounted(() => {
		if (!!props.title && hasHeadingSlot.value) {
			console.warn(
				"UiDialog: You have provided a title prop and a heading slot. The title prop will be ignored.",
			);
		}
	});

	/** Parent can call these functions */
	defineExpose({ close, open, toggle });
</script>

<template>
	<div class="UiDialog">
		<!-- Optional Trigger-->
		<div class="TriggerContainer" @click="toggle">
			<slot name="trigger"></slot>
		</div>

		<!-- Dialog Background + Card -->
		<div :class="`modal ${isOpen ? 'is-active' : ''}`">
			<div class="modal-background" @click="close"></div>
			<UiButton
				v-if="showTopCloseButton"
				class="modal-close is-large"
				aria-label="close"
				@click="close"
			></UiButton>

			<div class="modal-card" v-bind="$attrs">
				<!-- Dialog Heading -->
				<div v-if="hasHeadingSlot" class="modal-card-head">
					<p class="modal-card-title"><slot name="heading"></slot></p>
					<UiButton
						v-if="showHeadingCloseButton"
						class="delete"
						aria-label="close"
						@click="close"
					></UiButton>
				</div>
				<div v-else-if="title || icon" class="modal-card-head">
					<UiIcon v-if="icon" :icon="icon" />

					<p class="modal-card-title" v-if="title">{{ title }}</p>
					<UiButton
						v-if="showHeadingCloseButton"
						class="delete"
						aria-label="close"
						@click="close"
					></UiButton>
				</div>

				<!-- Dialog Content -->
				<div class="modal-card-body">
					<slot name="content"></slot>
				</div>

				<!-- Dialog Footer -->
				<div v-if="hasFooterSlot" class="modal-card-foot">
					<slot name="footer"></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	@layer app {
		.UiDialog {
			.TriggerContainer:empty {
				display: none;
			}
		}

		.modal {
			--bulma-modal-card-head-padding: 1rem 0.5rem;

			.modal-card-head {
				gap: 0.5rem;
			}
		}
	}
</style>
