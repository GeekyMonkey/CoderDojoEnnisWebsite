import { useNuxtApp } from "nuxt/app";
import type { TrpcType } from "@/plugins/trpcClient";

/**
 * Use TRCP client
 */
export const UseTrpc = (): TrpcType => {
	const { $trpc } = useNuxtApp();
	return $trpc as TrpcType;
};
