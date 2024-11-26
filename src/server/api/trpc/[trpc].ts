import { createNuxtApiHandler } from "trpc-nuxt";
import { appRouter } from "~~/shared/trpc/routers";
import { createContext } from "~~/shared/trpc/context";

// export API handler
export default createNuxtApiHandler({
	router: appRouter,
	createContext,
});
