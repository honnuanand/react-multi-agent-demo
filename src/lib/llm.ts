export type LLMParams = {
  provider: string;
  messages: any[];
  model: string;
  apiKey?: string;
  apiUrl?: string;
};

export async function callLLM({
  provider,
  messages,
  model,
  apiKey,
  apiUrl,
}: LLMParams) {
  const body: any = { messages, model };
  if (apiKey) body.apiKey = apiKey;
  if (apiUrl) body.apiUrl = apiUrl;
  console.log("Sending to backend:", body);
  const response = await fetch(`/api/llm/${provider}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${provider} API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
  }

  return response.json();
} 