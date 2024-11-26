import { useQuery } from "@tanstack/vue-query";
import { useTRPC } from "#app";

export function useTeamsStore() {
	const trpc = useTRPC();

	const {
		data: teams,
		isLoading,
		isError,
		error,
	} = useQuery(["teams"], async () => {
		const { data } = await trpc.query("teams.getAll");
		return data;
	});

	return {
		teams,
		isLoading,
		isError,
		error,
	};
}
