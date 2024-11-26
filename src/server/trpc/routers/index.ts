import { z } from "zod";
import { publicProcedure, router } from "../../shared/trpc";
import { getTeams } from "../queries/teams";

export const serverRouter = router({
	teams: publicProcedure.input(z.object({})).query(() => {
		return getTeams();
	}),
});
