// Asks an OpenAI-compatible chat model for a reply. Works with OpenAI, Azure OpenAI's v1 API,
// Groq, OpenRouter, Together, Gemini's OpenAI endpoint and most others: you choose the
// provider with three settings (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL).

/** Reads the provider settings, or null when the coach isn't set up. */
export function llmConfig(env = process.env) {
  const key = env.LLM_API_KEY?.trim()
  const model = env.LLM_MODEL?.trim()
  if (!key || !model) return null
  return {
    key,
    model,
    baseUrl: (env.LLM_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    // Some newer models want "max_completion_tokens" instead.
    tokenParam: env.LLM_TOKEN_PARAM?.trim() || 'max_tokens',
  }
}

/** Returns the reply text. Throws an Error with `status` when the provider refuses or fails. */
export async function chat(config, messages, { fetchImpl = fetch, signal, maxTokens = 220 } = {}) {
  const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.model, messages, temperature: 0.8, [config.tokenParam]: maxTokens }),
    signal,
  })
  if (!response.ok) {
    const error = new Error(`LLM answered ${response.status}`)
    error.status = response.status
    throw error
  }
  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ''
}
