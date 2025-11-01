# Proposal: replicate-legacy-features

## Summary

This proposal outlines the plan to replicate all features from the previous CoderDojo Ennis website, as detailed in `docs/PreviousFeatures.md`, using the new tech stack (Nuxt 4, Supabase, Cloudflare Workers, etc.). The goal is to maintain all existing functionality while modernizing the codebase.

## Motivation

The legacy website uses outdated technologies (ASP.NET MVC, SQL Server, etc.), making it hard to maintain and scale. This migration ensures a modern, secure, and maintainable platform.

## Scope

Replicate all user-facing features, back-end logic, and integrations, adapting them to the new architecture.

## Impact

- Complete rewrite of the application.
- Database schema migration to Supabase.
- UI migration to Vue/Nuxt components.
- API migration to Cloudflare Workers.

## Dependencies

- Supabase setup for auth and DB.
- Cloudflare Workers for serverless functions.

## Risks

- Feature parity might miss edge cases.
- Performance differences in new stack.

## Timeline

TBD based on tasks.

## Notes

Legacy source code can be referenced from `src_legacy` and can be used to gather details about how features were previously implemented.