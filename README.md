# TokenLedger

Self-hosted AI usage dashboard with a remote MCP endpoint. Track tokens, models, projects, and spend across [opencode](https://opencode.ai), Claude Code, Cursor, or any MCP client — all in your own Postgres database.

## Features

- **Live dashboard** — KPIs, stacked token volume, model/provider breakdown, top projects, recent activity.
- **MCP-native** — Query your spend from inside your agent via a stateless Streamable HTTP MCP server.
- **Automatic opencode reporting** — Drop in a plugin and every completed assistant message is recorded.
- **Plain HTTP ingest** — Post usage from any script with a bearer API key.
- **Self-hosted** — Deploy to Vercel + Neon/Supabase/RDS; data never leaves your database.
- **Idempotent logging** — Repeated `messageId` values are upserted (no double-counting).

## Quick start (local)

1. **Install dependencies**
   ```bash
   cd ~/Desktop/tokenledger
   npm install
   ```

2. **Start Postgres**
   A Postgres 18 install is available. Initialize and run one for dev:
   ```bash
   export PATH=/usr/lib/postgresql/18/bin:$PATH
   initdb -D .pgdata -U postgres --auth=trust
   pg_ctl -D .pgdata -o "-p 5433 -k /tmp" -l .pgdata/log start
   createdb -h /tmp -p 5433 -U postgres tokenledger
   ```

3. **Configure env**
   ```bash
   cp .env.example .env.local
   # set DATABASE_URL=postgres://postgres@127.0.0.1:5433/tokenledger
   ```

4. **Migrate and (optionally) seed**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   The seed prints an API key and tells you where to sign in.

5. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001). Create a ledger, copy the key, or sign in with a seed key.

## Connect to opencode

### Option 1: MCP server (query spend from your agent)
Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "tokenledger": {
      "type": "remote",
      "url": "https://YOUR-DEPLOYED-APP/api/mcp",
      "enabled": true,
      "headers": { "Authorization": "Bearer tl_your_key" }
    }
  }
}
```

Available tools: `get_usage_summary`, `get_model_breakdown`, `get_daily_usage`, `get_project_breakdown`, `list_recent_usage`, `log_usage`.

### Option 2: Auto-reporter plugin (track everything)
```bash
curl -fsSL https://YOUR-DEPLOYED-APP/api/plugin -o ~/.config/opencode/plugins/tokenledger.js
export TOKENLEDGER_URL=https://YOUR-DEPLOYED-APP
export TOKENLEDGER_API_KEY=tl_your_key
```
Restart opencode. Completed assistant messages are posted to `/api/ingest` automatically.

## Deploy to Vercel

1. Push `~/Desktop/tokenledger` to a Git repo.
2. Import into [Vercel](https://vercel.com/new).
3. Add `DATABASE_URL` (e.g. Neon pooled connection string with `sslmode=require`).
4. Deploy. Run migrations once against the production DB:
   ```bash
   DATABASE_URL=postgres://... npm run db:migrate
   ```
5. Open your Vercel URL, create a ledger on the landing page, and connect it to your terminal.

## API

### `POST /api/ingest`
Bearer auth required. Accepts a single event or `{ "events": [...] }` (max 500).

```bash
curl -X POST https://YOUR-APP/api/ingest \
  -H "Authorization: Bearer tl_..." \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-5","provider":"anthropic","inputTokens":1200,"outputTokens":450,"costUsd":0.0104}'
```

### `GET /api/stats?range=month|7d|30d|all|YYYY-MM`
Auth via Bearer key or session cookie. Returns totals, previous-period deltas, daily/monthly series, model/provider/project breakdowns, and recent events.

### `POST /api/mcp`
Streamable HTTP MCP server. Requires `Authorization: Bearer tl_...`. JSON response mode enabled; sessionless.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string. Use a pooled URL on serverless. |
| `APP_URL` | No | Public URL used in generated snippets. Falls back to request headers. |
| `NODE_ENV` | No | `production` enables secure cookies. |

## Notes

- Cookies are `httpOnly`, `sameSite=lax`. In production over HTTPS, `secure` is true.
- API keys are stored as SHA-256 hashes.
- Sessions last 30 days.
- Token totals include input, output, reasoning, and cache tokens.
- The dashboard is server-rendered against Postgres; pages use dynamic rendering because they read session cookies.
