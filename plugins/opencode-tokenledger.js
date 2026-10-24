// TokenLedger reporter for opencode.
// Save as ~/.config/opencode/plugins/tokenledger.js
//
// Required environment variables:
//   TOKENLEDGER_URL      e.g. https://your-ledger.vercel.app
//   TOKENLEDGER_API_KEY  tl_...
//
// Optional:
//   TOKENLEDGER_PROJECT  override the detected project directory

const reported = new Set()

export const TokenLedger = async ({ client }) => {
  let baseUrl = (process.env.TOKENLEDGER_URL || "").trim()
  while (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1)
  const apiKey = (process.env.TOKENLEDGER_API_KEY || "").trim()

  function log(level, message, extra) {
    if (!client || !client.app || !client.app.log) return
    client.app
      .log({ body: { service: "tokenledger", level, message, extra } })
      .catch(function () {})
  }

  if (!baseUrl || !apiKey) {
    log("warn", "TokenLedger disabled: set TOKENLEDGER_URL and TOKENLEDGER_API_KEY.")
    return {}
  }

  async function report(info) {
    const payload = {
      messageId: info.id,
      sessionId: info.sessionID,
      provider: info.providerID || "unknown",
      model: info.modelID || "unknown",
      inputTokens: (info.tokens && info.tokens.input) || 0,
      outputTokens: (info.tokens && info.tokens.output) || 0,
      reasoningTokens: (info.tokens && info.tokens.reasoning) || 0,
      cacheReadTokens: (info.tokens && info.tokens.cache && info.tokens.cache.read) || 0,
      cacheWriteTokens: (info.tokens && info.tokens.cache && info.tokens.cache.write) || 0,
      costUsd: info.cost || 0,
      project:
        process.env.TOKENLEDGER_PROJECT ||
        (info.path && info.path.root) ||
        (info.path && info.path.cwd) ||
        undefined,
      mode: info.mode,
      source: "opencode",
      eventAt: new Date(
        (info.time && (info.time.completed || info.time.created)) || Date.now(),
      ).toISOString(),
    }

    const response = await fetch(baseUrl + "/api/ingest", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("TokenLedger responded " + response.status)
    }
  }

  return {
    event: async ({ event }) => {
      if (!event || event.type !== "message.updated") return
      const info = event.properties && event.properties.info
      if (!info || info.role !== "assistant") return
      if (!info.time || !info.time.completed) return
      if (reported.has(info.id)) return
      reported.add(info.id)

      try {
        await report(info)
      } catch (error) {
        reported.delete(info.id)
        log("warn", "Failed to report usage to TokenLedger.", {
          error: String(error),
        })
      }
    },
  }
}
