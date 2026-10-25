create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  message_id text,
  session_id text,
  provider text not null default 'unknown',
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  reasoning_tokens integer not null default 0 check (reasoning_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_usd numeric(14, 6) not null default 0 check (cost_usd >= 0),
  project text,
  mode text,
  source text not null default 'api',
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists usage_events_workspace_message_uidx
  on usage_events (workspace_id, message_id)
  where message_id is not null;

create index if not exists usage_events_workspace_event_idx
  on usage_events (workspace_id, event_at desc);

create index if not exists usage_events_workspace_model_idx
  on usage_events (workspace_id, model);

create index if not exists sessions_workspace_idx
  on sessions (workspace_id);

create index if not exists sessions_user_idx
  on sessions (user_id);

create index if not exists sessions_expires_idx
  on sessions (expires_at);

create index if not exists workspaces_user_idx
  on workspaces (user_id);
