// export default defineRequestMiddleware((nitroApp) => {
//   console.log("--Nitro Middleware--", { nitroApp });
// });

const auth = defineRequestMiddleware((event) => {
  event.context.nuxtmiddlewareinjected = 42;
  const host = getRequestHost(event);
  event.context.subdomain = host.split(".")[0];
  event.context.host = host;
  console.log("Middleware Req", { host });
});

const compression = defineResponseMiddleware((event) => {
  // Example: https://stackblitz.com/edit/github-mb6bz3
  console.log("Middleware Res", { host: event.context.host });
});

export default eventHandler({
  onRequest: [auth],
  onBeforeResponse: [compression],
  async handler(event) {
    const subdomain = event.context.subdomain;
    if (subdomain === "member" && !event.path.startsWith("/api")) {
      // Proxy this request to another server using the same http method and body
      const url = `https://coderdojomember.azurewebsites.net${event.path}`;
      return sendRedirect(event, url);
      //   //   const body = await readBody(event);
      //   const body = event._requestBody;
      //   console.log("Proxying request to", url);
      //   return await fetch(url, {
      //     method: event.method,
      //     body: body,
      //     headers: event.headers,
      //   });
    }
  },
});
