<script lang="ts"></script>

<template>
	<div class="panel UiCard">
		<div class="panel-heading CardHeading">
			<slot name="heading"></slot>
		</div>
		<div class="CardContent">
			<slot></slot>
		</div>
		<div class="CardFooter">
			<slot name="footer"></slot>
		</div>
	</div>
</template>

<style lang="scss">
	.UiCard {
		border-width: 1px;
		border-style: solid;

		.CardHeading,
		.CardFooter {
			&:empty {
				display: none;
			}
		}

		.CardContent {
			padding: 1rem;
		}

		.CardFooter {
			padding: 1rem;
			// border-top-width: 1px;
			// border-top-style: solid;
		}
	}
</style>
