# Change: Restore coder sessions and joining

## Why
Legacy coders can browse upcoming non-mentor pods, see up to two hosts, join a pod with attendance recording and consult the calendar when none are scheduled. The new application has no coder sessions route and the migrated sessions table retained only date, topic and visibility.

## What Changes
- Add a separate session_pods schedule with nullable end time, URL and two host references; attendance sessions keep their existing one-date constraint.
- Add strict own-coder listing/joining APIs, validated query/mutation store and reusable session/host/calendar components.
- Join atomically records only the authenticated coder's Dublin-today attendance, idempotently, after rechecking visibility, expiry and URL.
- Refresh realtime edits and timed expiry without page reload.

## Impact
C08, additive migration, generated database types, navigation, locales and Bruno requests. Mentor session maintenance and public/parent sessions remain separate master tasks. The user authorizes implementation and automatic publication.
