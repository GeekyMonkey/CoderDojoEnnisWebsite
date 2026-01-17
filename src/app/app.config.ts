export default defineAppConfig({
	ui: {
		checkbox: {
			slots: {
				root: "Checkbox_Root",
			},
		},
		icons: {
			collections: "all",
		},
		modal: {
			slots: {
				overlay: "fixed inset-0 bg-elevated/75 ModalOverlay",
				content:
					"fixed bg-default divide-y divide-default flex flex-col focus:outline-none ModalContent",
				header: "flex items-center gap-1.5 p-4 sm:px-6 min-h-16 ModalHeader",
				wrapper: "",
				body: "flex-1 overflow-y-auto p-4 sm:p-6 ModalBody",
				footer: "flex items-center gap-1.5 p-4 sm:px-6 ModalFooter",
				title: "text-highlighted font-semibold ModalTitle",
				description: "mt-1 text-muted text-sm ModalDescription",
				close: "absolute top-4 end-4 ModalClose",
			},
			variants: {
				transition: {
					true: {
						overlay:
							"data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]",
						content:
							"data-[state=open]:animate-[scale-in_200ms_ease-out] data-[state=closed]:animate-[scale-out_200ms_ease-in]",
					},
				},
				fullscreen: {
					true: {
						content: "inset-0",
					},
					false: {
						content:
							"top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-lg shadow-lg ring ring-default overflow-hidden",
					},
				},
			},
		},
		select: {
			slots: {
				content: "max-h-60 min-w-(--reka-select-trigger-width) w-fit bg-default shadow-lg rounded-md ring ring-default overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-select-content-transform-origin) pointer-events-auto flex flex-col",
				trailing: "ms-auto flex items-center !pe-0",
				item: "group relative w-full flex items-start select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 text-default data-highlighted:not-data-disabled:text-highlighted data-highlighted:not-data-disabled:before:bg-[var(--ui-text-highlighted)] data-highlighted:not-data-disabled:text-[var(--ui-text-inverted)] data-[state=checked]:before:bg-[var(--ui-text-highlighted)] data-[state=checked]:text-[var(--ui-text-inverted)] transition-colors before:transition-colors",
				itemTrailing: "hidden",
				itemLabel: "truncate pr-[5px]",
			},
		},
		table: {
			slots: {
				td: "py-2 first:px-0 last:px-0 px-3",
			},
		}
	},
});
