import type { CallLLMParams } from './openai';

export async function callLLM({ messages, model, apiKey, apiUrl }: CallLLMParams): Promise<string> {
  if (!apiKey || !apiUrl) throw new Error('Databricks API key and URL are required');
  const res = await fetch('/api/llm/databricks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model,
      apiKey,
      apiUrl,
    }),
  });
  if (!res.ok) throw new Error('Databricks API error: ' + res.statusText);
  const data = await res.json();
  return data.choices?.[0]?.text || data.predictions?.[0] || data.result || 'No response from Databricks';
} 