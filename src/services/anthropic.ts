import { LLMParams, LLMResponse } from './llm';

export async function callLLM(params: LLMParams): Promise<LLMResponse> {
  try {
    const response = await fetch('/api/llm/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7,
        stream: false,
        apiKey: params.apiKey,
        apiUrl: params.apiUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: params.model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: data.usage?.input_tokens + data.usage?.output_tokens || 0
      }
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
} 