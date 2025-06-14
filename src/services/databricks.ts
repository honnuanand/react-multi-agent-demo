import type { CallLLMParams } from './openai';

export async function callLLM({ prompt, model, apiKey, apiUrl }: CallLLMParams): Promise<string> {
  if (!apiKey || !apiUrl) throw new Error('Databricks API key and URL are required');
  // Assume apiUrl is the full endpoint URL, e.g. https://.../serving-endpoints/ENDPOINT/invocations
  const userPrompt = prompt.filter((p: { role: string }) => p.role === 'user').map((p: { content: string }) => p.content).join('\n');
  const systemPrompt = prompt.find((p: { role: string }) => p.role === 'system')?.content || '';
  const body = {
    inputs: [
      {
        prompt: `${systemPrompt}\n${userPrompt}`,
        // Optionally add model, etc.
      }
    ]
  };
  const res = await fetch('/api/llm/databricks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model,
      apiKey,
      apiUrl,
    }),
  });
  if (!res.ok) throw new Error('Databricks API error: ' + res.statusText);
  const data = await res.json();
  // Try to extract the response text
  return data.choices?.[0]?.text || data.predictions?.[0] || data.result || 'No response from Databricks';
} 