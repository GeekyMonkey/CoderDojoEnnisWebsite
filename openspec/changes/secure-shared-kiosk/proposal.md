# Change: Secure shared kiosk access (F12)

## Why
Shared sign-in currently keeps a mentor session, allowing management access on the kiosk device.

## What Changes
- Replace mentor authority with a signed HttpOnly kiosk cookie, valid only for the current Dublin day and at most 12 hours.
- Revoke the originating portal session, block its token through API and database authorization, clear client auth/caches and require fresh authentication for management.
- Add cookie-scoped kiosk start/status/end/sign-in endpoints and a dedicated page/store. Preserve F03 hardware API contracts and the beta legacy redirect.

## Impact
- Affected specs: kiosk-access
- Affected code: auth guards, RLS identity helper, kiosk APIs/store/page, Bruno requests and tests.
- Authorized by the user's explicit F12 instruction to log out the mentor and provide an alternative security cookie.
