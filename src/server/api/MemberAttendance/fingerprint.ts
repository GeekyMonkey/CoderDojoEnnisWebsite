import { defineEventHandler } from "h3";

export default defineEventHandler(async (event): Promise<any[]> => {
  // Access the query string from the event object
  const query = event.node.req.url
    ? new URL(event.node.req.url, `http://${event.node.req.headers.host}`)
        .searchParams
    : new URLSearchParams();
  const id = Number(query.get("id") || -1);
  const testing = Boolean(query.get("testing") == "true");

  // proxy to the old api
  const response = await fetch(
    `https://coderdojomember.azurewebsites.net/api/MemberAttendance/fingerprint?id=${id}&testing=${testing}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event._requestBody),
    }
  );
  const reply = await response.json();
  return reply;
});
