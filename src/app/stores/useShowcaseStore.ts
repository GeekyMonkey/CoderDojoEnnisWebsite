import {
	useMutation,
	useQuery,
	useQueryClient,
	type QueryFunctionContext,
	type UseQueryReturnType,
	type UseMutationReturnType,
} from "@tanstack/vue-query";
import { computed, type ComputedRef } from "vue";
import { useShowcaseRealtime } from "~/composables/useShowcaseRealtime";
import type {
	ShowcaseContext,
	ShowcaseFields,
	ShowcaseItem,
	ProjectPreview,
	ProjectType,
} from "#shared/types/Showcase";
import { useProfileAuthorization } from "~/composables/useProfileAuthorization";

export type SaveInput = {
	id: string | null;
	expectedUpdatedAt: string | null;
	fields: ShowcaseFields;
	png?: string | null;
	removeImage?: boolean;
};
type DiscoverInput = {
	projectType: ProjectType;
	url?: string;
	offset?: number;
};
export type ShowcaseStore = UseQueryReturnType<
	ShowcaseContext | ShowcaseItem[],
	Error
> & {
	items: ComputedRef<ShowcaseItem[]>;
	context: ComputedRef<ShowcaseContext | undefined>;
	save: UseMutationReturnType<ShowcaseItem, Error, SaveInput, unknown>;
	remove: UseMutationReturnType<unknown, Error, ShowcaseItem, unknown>;
	discover: UseMutationReturnType<
		ProjectPreview[],
		Error,
		DiscoverInput,
		unknown
	>;
	validate: UseMutationReturnType<{ url: string }, Error, void, unknown>;
	image: UseMutationReturnType<File, Error, string, unknown>;
};

/** Keep public/member data, mutations and row-free live refresh in TanStack stores. */
export function useShowcaseStore(
	memberId: () => string | null = (): null => null,
	manage: boolean = false,
): ShowcaseStore {
	const cache: ReturnType<typeof useQueryClient> = useQueryClient();
	const authorization: ReturnType<typeof useProfileAuthorization> =
		useProfileAuthorization();
	const client: ReturnType<typeof useSupabaseClient> = useSupabaseClient();
	const key: ComputedRef<readonly unknown[]> = computed(
		(): readonly unknown[] => [
			"showcase",
			manage ? "manage" : "public",
			memberId(),
		],
	);
	/** Supply optional target-member context to protected API calls. */
	function params(): { memberId?: string } {
		return memberId() ? { memberId: memberId()! } : {};
	}
	const query: UseQueryReturnType<ShowcaseContext | ShowcaseItem[], Error> =
		useQuery({
			queryKey: key,
			queryFn: async ({
				signal,
			}: QueryFunctionContext): Promise<ShowcaseContext | ShowcaseItem[]> => {
				if (!manage) return $fetch<ShowcaseItem[]>("/api/showcase", { signal });
				const headers: Awaited<ReturnType<typeof authorization>> =
					await authorization();
				const result: ShowcaseContext = await $fetch("/api/showcase/manage", {
					query: params(),
					headers,
					signal,
				});
				return result;
			},
		});
	/** Refresh every mounted showcase projection after a saved action. */
	async function invalidate(): Promise<void> {
		await cache.cancelQueries({ queryKey: ["showcase"] });
		await Promise.all(
			["showcase", "achievementReviews"].map((key: string): Promise<void> =>
				cache.invalidateQueries({ queryKey: [key] }),
			),
		);
	}
	const save: UseMutationReturnType<ShowcaseItem, Error, SaveInput, unknown> =
		useMutation<ShowcaseItem, Error, SaveInput>({
			mutationFn: async (input: SaveInput): Promise<ShowcaseItem> =>
				$fetch("/api/showcase/save", {
					method: "POST",
					query: params(),
					headers: await authorization(),
					body: input,
				}),
			onSuccess: invalidate,
		});
	const remove: UseMutationReturnType<unknown, Error, ShowcaseItem, unknown> =
		useMutation<unknown, Error, ShowcaseItem>({
			mutationFn: async (item: ShowcaseItem): Promise<unknown> =>
				$fetch("/api/showcase/delete", {
					method: "POST",
					query: params(),
					headers: await authorization(),
					body: { id: item.id, expectedUpdatedAt: item.updatedAt },
				}),
			onSuccess: invalidate,
		});
	const discover: UseMutationReturnType<
		ProjectPreview[],
		Error,
		DiscoverInput,
		unknown
	> = useMutation<ProjectPreview[], Error, DiscoverInput>({
		mutationFn: async (input: {
			projectType: ProjectType;
			url?: string;
			offset?: number;
		}): Promise<ProjectPreview[]> =>
			$fetch("/api/showcase/projects", {
				query: { ...params(), ...input },
				headers: await authorization(),
			}),
	});
	const validate: UseMutationReturnType<{ url: string }, Error, void, unknown> =
		useMutation<{ url: string }, Error, void>({
			mutationFn: async (): Promise<{ url: string }> =>
				$fetch("/api/showcase/validate", {
					method: "POST",
					query: params(),
					headers: await authorization(),
				}),
		});
	const image: UseMutationReturnType<File, Error, string, unknown> =
		useMutation<File, Error, string>({
			mutationFn: async (url: string): Promise<File> => {
				const blob: Blob = await $fetch("/api/showcase/image-source", {
					query: { ...params(), url },
					headers: await authorization(),
					responseType: "blob",
				});
				return new File([blob], "project-image", { type: blob.type });
			},
		});
	const context: ComputedRef<ShowcaseContext | undefined> = computed(
		(): ShowcaseContext | undefined =>
			manage ? (query.data.value as ShowcaseContext) : undefined,
	);
	const items: ComputedRef<ShowcaseItem[]> = computed((): ShowcaseItem[] =>
		manage
			? (context.value?.items ?? [])
			: ((query.data.value as ShowcaseItem[]) ?? []),
	);
	useShowcaseRealtime();

	return { ...query, items, context, save, remove, discover, validate, image };
}
