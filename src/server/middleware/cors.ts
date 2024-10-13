// server/middleware/cors.ts
export default defineEventHandler((event) => {
  const method = event.node.req.method;

  console.log("Cors middleware", { method });
  const responseHeaders = event.node.res.getHeaders();

  responseHeaders["Access-Control-Allow-Origin"] = "*";
  responseHeaders["Access-Control-Allow-Methods"] =
    "GET, POST, PUT, DELETE, OPTIONS";
  responseHeaders["Access-Control-Allow-Headers"] =
    "Content-Type, Authorization";

  if (method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
    return;
  }
});
