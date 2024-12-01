import { config } from "@vue/test-utils";
import { vi } from "vitest";

config.global.mocks = {
	useRuntimeConfig: vi.fn(() => ({
		// Mock your runtime config properties here
	})),
};
