export default defineNitroPlugin((nitroApp) => {
	console.log("--Starting CoderDojo Nitro Server--");

	// Output all env variables
	console.log("Environment Variables:");
	console.log(process.env);
	console.log("----------");
});
