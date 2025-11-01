# Design: replicate-legacy-features

## Overview

The legacy system was built with ASP.NET MVC, SQL Server, and traditional server-side rendering. The new system uses Nuxt (Vue SSR), Supabase (Postgres + Auth), and Cloudflare Workers for APIs.

## Key Mappings

- MVC Controllers -> Nuxt Pages/Components + API Routes in Workers
- Entity Framework -> Supabase Client/Queries
- Views -> Vue Components with NuxtUI
- Authentication -> Supabase Auth
- Real-time -> Supabase Realtime
- Image Upload -> Cloudflare R2 or Supabase Storage

## Patterns

- Use composables for data fetching (e.g., useSupabaseClient)
- Role-based access with middleware
- Shared types in shared/types
- API contracts in server/api

## Trade-offs

- SSR vs Client-side: Nuxt provides SSR for better SEO and performance.
- Database: Supabase provides auth and realtime out of the box.
- Scalability: Serverless workers scale better than traditional servers.