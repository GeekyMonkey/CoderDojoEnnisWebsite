# Design

A mentor starts the session using their verified current role and bearer token. A private revoked-session registry prevents replay of that session UUID through protected APIs and RLS, independently of JWT expiry. Refresh is revoked through Supabase admin sign-out. The browser signs out locally, clears private caches/channels and navigates with a hard replacement to the separate kiosk page. Other protected tabs receiving SIGNED_OUT replace their view with fresh login; restored protected browser-history pages reload and revalidate persisted credentials.

A host-only, HttpOnly, SameSite=Strict cookie is HMAC-signed using a domain-separated server service-role secret, Secure in production, with a random nonce, explicit scope, expiry and Dublin day. It grants no portal identity or database access. Same-origin checks protect all cookie-authorized mutations. Status/sign-in check signature, scope, day and expiry each time; ending clears the cookie. The kiosk uses narrow sign-in responses and no mentor-directory stores. F13 live board remains separate.

The session registry is private, has RLS and no client grants. Service-only functions register mentor-session revocation and inspect it. Database RLS current_member_id rejects revoked JWT session IDs. Management requires a newly authenticated session. Existing F03 hardware endpoints and beta redirect remain unchanged.
