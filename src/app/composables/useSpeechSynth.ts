import type { LangCode } from "#shared/types/Translation";

const defaultLang = "en-IE";
const defaultVoice = "Connor";
const log = useLogger("useSpeechSynth");

type LangAndVoice = {
	lang: string;
	voiceName: string;
};

/**
 * Map locale codes to speech synthesis language codes
 */
const localeToSpeechLangAndVoiceName: Record<LangCode, LangAndVoice> = {
	en: { lang: "en-IE", voiceName: "Connor" },
	fr: { lang: "fr-FR", voiceName: "Eloise" },
	ga: { lang: "ga-IE", voiceName: "Orla" },
	uk: { lang: "uk-UA", voiceName: "Polina" },
};

const resolveVoice = (
	voices: SpeechSynthesisVoice[],
	lang: string,
	voiceName?: string,
): SpeechSynthesisVoice | undefined => {
	const filtered = voices.filter((v) => v.lang === lang);
	if (voiceName) {
		const matchedVoice = filtered.find((v) =>
			v.name.toLowerCase().includes(voiceName.toLowerCase()),
		);
		if (matchedVoice) {
			return matchedVoice;
		}
	}

	return filtered?.[0];
};

/**
 * Speech synthesis composable that uses the user's configured language
 */
export function useSpeechSynth() {
	const { locale } = useI18n();
	const textToSpeak = ref("");
	const voices = ref<SpeechSynthesisVoice[]>([]);
	const currentLang = ref(
		localeToSpeechLangAndVoiceName[locale.value as LangCode]?.lang ||
			defaultLang,
	);
	const currentVoice = ref<SpeechSynthesisVoice | undefined>(undefined);

	const updateVoiceForLocale = (targetLocale: LangCode): void => {
		const { lang, voiceName } = localeToSpeechLangAndVoiceName[
			targetLocale
		] || {
			lang: defaultLang,
			voiceName: defaultVoice,
		};
		currentLang.value = lang;
		currentVoice.value = resolveVoice(voices.value, lang, voiceName);
		log.info("locale changed", {
			newLang: lang,
			voice: currentVoice.value?.name,
		});
	};

	const loadVoices = (): boolean => {
		if (
			!process.client ||
			typeof window === "undefined" ||
			!window.speechSynthesis
		) {
			return false;
		}

		const loaded = window.speechSynthesis.getVoices();
		if (!loaded.length) {
			return false;
		}
		voices.value = loaded;
		updateVoiceForLocale(locale.value as LangCode);
		return true;
	};

	const speech = useSpeechSynthesis(textToSpeak, {
		lang: currentLang,
		voice: computed(
			() => currentVoice.value,
		) as unknown as MaybeRef<SpeechSynthesisVoice>,
	});
	console.log("Speech Initialized", {
		isSupported: speech.isSupported.value,
		currentLang,
		currentVoice,
		voices: voices.value,
	});

	/**
	 * Re-initialize when locale changes
	 */
	watch(
		() => locale.value,
		(newLocale) => {
			updateVoiceForLocale(newLocale as LangCode);
		},
		{ immediate: true },
	);

	onMounted(() => {
		if (loadVoices()) {
			return;
		}

		const handleVoicesChanged = () => {
			if (loadVoices()) {
				window.speechSynthesis.removeEventListener(
					"voiceschanged",
					handleVoicesChanged,
				);
			}
		};

		window.speechSynthesis.addEventListener(
			"voiceschanged",
			handleVoicesChanged,
		);
		// Trigger voice loading on some browsers
		window.speechSynthesis.getVoices();
	});

	/**
	 * Speak the given text in the user's configured language
	 */
	const speak = (text: string): void => {
		if (!text) {
			return;
		}

		textToSpeak.value = text;
		speech.speak();
	};

	return {
		speak,
		isSupported: speech.isSupported,
		isPlaying: speech.isPlaying,
		status: speech.status,
		toggle: speech.toggle,
		stop: speech.stop,
		voice: currentVoice,
		language: currentLang,
	};
}
