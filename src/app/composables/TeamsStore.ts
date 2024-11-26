import { useQuery } from "@tanstack/vue-query";
import { UseTrpc } from "./UseTrpc";

export function useTeamsStore() {
	const trpc = UseTrpc();

	const {
		data: teams,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["teams"],
		queryFn: async () => {
			const teams = await trpc.teams.query({});
			return teams;
		},
	});

	return {
		teams,
		isLoading,
		isError,
		error,
	};
}
