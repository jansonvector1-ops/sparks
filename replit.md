# AI Chat App

A multi-model AI chat application that lets users converse with various free LLMs via OpenRouter.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS, built with Vite (port 5000)
- **Backend**: Express.js server (port 3001), proxied through Vite's dev server
- **Database**: Replit PostgreSQL via Drizzle ORM
- **AI**: OpenRouter API for LLM access (streamed responses)

## Key Files

- `src/App.tsx` — Main React app with chat UI, sidebar, model selection
- `src/lib/api.ts` — Client-side API helpers (all calls go to `/api/*`)
- `src/lib/models.ts` — List of available OpenRouter models
- `src/components/` — ChatMessage, ChatInput, ModelSelector components
- `server/index.ts` — Express server with REST API routes + OpenRouter proxy
- `server/db.ts` — Drizzle database connection
- `shared/schema.ts` — Drizzle schema: `conversations` and `messages` tables

## Environment Variables / Secrets

- `OPENROUTER_API_KEY` — Required secret for OpenRouter AI calls
- `DATABASE_URL` — Auto-provisioned by Replit PostgreSQL

## Dev Commands

```bash
npm run dev        # Start both servers (Vite on 5000, Express on 3001)
npm run db:push    # Sync database schema
npm run build      # Production build
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/conversations | List recent conversations |
| POST | /api/conversations | Create a conversation |
| PATCH | /api/conversations/:id | Rename a conversation |
| DELETE | /api/conversations/:id | Delete a conversation |
| GET | /api/conversations/:id/messages | Get messages for a conversation |
| POST | /api/conversations/:id/messages | Save a message |
| DELETE | /api/messages/:id | Delete a message |
| POST | /api/chat | Stream AI response via OpenRouter |

## Migration Notes (Bolt → Replit)

- Removed Supabase (`@supabase/supabase-js`) entirely
- Removed Supabase Edge Function (`supabase/functions/chat/index.ts`) — replaced with `/api/chat` Express route
- Database moved from Supabase Postgres to Replit PostgreSQL
- OpenRouter API key is now server-side only (was previously exposed via `VITE_SUPABASE_*` env vars in the browser)
- `concurrently` runs both the Express server and Vite dev server together
