import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
	hello: publicProcedure
		.input(
			z.object({
				text: z.string(),
			}),
		)
		.query(({ input }) => {
			return {
				greeting: `hello ${input.text ?? "world"}`,
			};
		}),
	teams: publicProcedure.input(z.object({})).query(() => {
		return [
			{ id: "1", name: "Team 1" },
			{ id: "2", name: "Team 2" },
		];
	}),
});

// export type definition of API
export type AppRouter = typeof appRouter;
