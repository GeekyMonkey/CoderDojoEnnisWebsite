import { H3Event } from "h3";
import { SetServerContext } from "~~/server/db/UseDrizzle";

export default defineEventHandler((event: H3Event) => {
	SetServerContext(event.context);
});
