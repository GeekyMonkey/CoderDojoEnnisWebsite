export default defineNitroPlugin((nitroApp) => {
	const log = useLogger("startup-server");
	console.log("\n\n\n"); // Blank line for readability
	log.info("--Starting CoderDojo Nitro Server--");

	// Output all env variables
	log.verbose("Environment Variables:", { env: process.env });
	log.verbose("----------");
});
