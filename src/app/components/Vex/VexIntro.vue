<script setup lang="ts">
	const { t } = useI18n();

	const STEP_KEYS: string[] = ["step1", "step2", "step3", "step4", "step5"];

	const steps = computed<string[]>(() =>
		STEP_KEYS.map((key) => t(`vex.home.howItWorks.steps.${key}`)),
	);
</script>

<template>
	<section class="VexIntro">
		<div class="VexIntroText">
			<p class="VexIntroLead">{{ t("vex.home.intro.p1") }}</p>
			<p>{{ t("vex.home.intro.p2") }}</p>
			<p>{{ t("vex.home.intro.p3") }}</p>
			<p class="VexIntroAim">{{ t("vex.home.intro.p4") }}</p>
		</div>

		<div class="VexHowItWorks">
			<h3 class="VexHowItWorksHeading">
				{{ t("vex.home.howItWorks.heading") }}
			</h3>
			<ol class="VexSteps">
				<li v-for="(step, index) in steps" :key="index" class="VexStep">
					<span class="VexStepNumber">{{ index + 1 }}</span>
					<span>{{ step }}</span>
				</li>
			</ol>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.VexIntro {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: calc(var(--spacing) * 6);
		align-items: start;
	}

	.VexIntroText {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 3);
		line-height: 1.5;
	}

	.VexIntroLead {
		font-size: 1.15rem;
		font-weight: 700;
	}

	.VexIntroAim {
		font-weight: 600;
		color: var(--ui-primary);
	}

	.VexHowItWorks {
		background: var(--ui-bg-elevated);
		border-radius: var(--border-radius);
		padding: calc(var(--spacing) * 4);
	}

	.VexHowItWorksHeading {
		font-weight: 700;
		margin-bottom: calc(var(--spacing) * 3);
	}

	.VexSteps {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) * 2);
	}

	.VexStep {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 3);
	}

	.VexStepNumber {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: var(--ui-primary);
		color: var(--ui-bg);
		font-weight: 700;
	}

	@media (max-width: 900px) {
		.VexIntro {
			grid-template-columns: 1fr;
		}
	}
</style>
