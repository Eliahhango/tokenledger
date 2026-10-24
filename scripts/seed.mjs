import { createHash, randomBytes, randomUUID } from "node:crypto";
import postgres from "postgres";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const apiKey = process.env.SEED_API_KEY || `tl_${randomBytes(24).toString("base64url")}`;
const keyHash = createHash("sha256").update(apiKey).digest("hex");
const keyPrefix = apiKey.slice(0, 11);

const sql = postgres(url, { max: 2, prepare: false });

const models = [
  { provider: "anthropic", model: "claude-sonnet-4-5", weights: [3, 15, 0.3, 3.75], share: 0.34 },
  { provider: "openai", model: "gpt-5.2", weights: [1.25, 10, 0.125, 1.25], share: 0.24 },
  { provider: "google", model: "gemini-3-pro", weights: [1.25, 10, 0.31, 1.25], share: 0.16 },
  { provider: "opencode", model: "big-pickle", weights: [0.5, 2, 0.05, 0.5], share: 0.16 },
  { provider: "moonshot", model: "kimi-k2", weights: [0.6, 2.5, 0.06, 0.6], share: 0.1 },
];

const projects = [
  "/home/eliah/Desktop/tokenledger",
  "/home/eliah/Desktop/eliflix-app",
  "/home/eliah/Desktop/khamiar-express2",
  "/home/eliah/projects/etl-pipeline",
  "/home/eliah/projects/docs-site",
];

const modes = ["build", "plan", "general"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickModel() {
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of models) {
    cumulative += entry.share;
    if (roll <= cumulative) return entry;
  }
  return models[0];
}

function buildEvent(dayOffset) {
  const entry = pickModel();
  const [inputPrice, outputPrice, cacheReadPrice, cacheWritePrice] = entry.weights;
  const inputTokens = rand(4_000, 70_000);
  const outputTokens = rand(300, 9_000);
  const reasoningTokens = Math.random() < 0.35 ? rand(200, 6_000) : 0;
  const cacheReadTokens = Math.random() < 0.55 ? rand(10_000, 120_000) : 0;
  const cacheWriteTokens = Math.random() < 0.4 ? rand(2_000, 30_000) : 0;

  const cost =
    (inputTokens * inputPrice +
      outputTokens * outputPrice +
      cacheReadTokens * cacheReadPrice +
      cacheWriteTokens * cacheWritePrice) /
    1_000_000;

  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  base.setUTCDate(base.getUTCDate() - dayOffset);
  base.setUTCMinutes(rand(7 * 60, 23 * 60));

  return {
    workspace_id: null,
    message_id: randomUUID(),
    session_id: randomUUID(),
    provider: entry.provider,
    model: entry.model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    reasoning_tokens: reasoningTokens,
    cache_read_tokens: cacheReadTokens,
    cache_write_tokens: cacheWriteTokens,
    cost_usd: Number(cost.toFixed(6)),
    project: pick(projects),
    mode: pick(modes),
    source: "opencode",
    event_at: base,
  };
}

try {
  const [workspace] = await sql`
    insert into workspaces (name, key_hash, key_prefix)
    values ('Demo workspace', ${keyHash}, ${keyPrefix})
    returning id, name
  `;

  const rows = [];
  for (let day = 59; day >= 0; day -= 1) {
    const weekend = [0, 6].includes(new Date(Date.now() - day * 86_400_000).getUTCDay());
    const count = weekend ? rand(2, 8) : rand(8, 26);
    for (let i = 0; i < count; i += 1) {
      rows.push({ ...buildEvent(day), workspace_id: workspace.id });
    }
  }

  const limited = rows.slice(0, 3000);
  for (let i = 0; i < limited.length; i += 250) {
    const batch = limited.slice(i, i + 250);
    await sql`
      insert into usage_events ${sql(
        batch,
        "workspace_id",
        "message_id",
        "session_id",
        "provider",
        "model",
        "input_tokens",
        "output_tokens",
        "reasoning_tokens",
        "cache_read_tokens",
        "cache_write_tokens",
        "cost_usd",
        "project",
        "mode",
        "source",
        "event_at",
      )}
    `;
  }

  console.log(`Seeded "${workspace.name}" with ${limited.length} usage events.`);
  console.log(`API key: ${apiKey}`);
  console.log("Sign in at /login with this key.");
} finally {
  await sql.end();
}
