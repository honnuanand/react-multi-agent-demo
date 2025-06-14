import { callLLM as callOpenAI } from './openai';
import { callLLM as callAnthropic } from './anthropic';
import { callLLM as callDatabricks } from './databricks';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type LLMProvider = 'openai' | 'anthropic' | 'databricks';

export interface LLMParams {
  provider: LLMProvider;
  model: string;
  messages: Message[];
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  apiUrl?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function callLLM(params: LLMParams): Promise<LLMResponse> {
  switch (params.provider) {
    case 'openai': {
      // OpenAI expects 'prompt' instead of 'messages'
      const { provider, messages, ...rest } = params;
      const prompt = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await callOpenAI({ provider, ...rest, prompt });
      // Adapt result to LLMResponse if needed
      if (typeof result === 'string') {
        return {
          content: result,
          model: params.model,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
      }
      const typedResult = result as { choices: Array<{ message: { content: string } }> };
      if (typedResult && typedResult.choices && Array.isArray(typedResult.choices)) {
        return {
          content: typedResult.choices.map(choice => choice.message.content).join('\n'),
          model: params.model,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
      }
      throw new Error('Invalid response format from API');
    }
    case 'databricks': {
      // Databricks expects 'prompt' instead of 'messages'
      const { provider, messages, ...rest } = params;
      const prompt = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await callDatabricks({ provider, ...rest, prompt });
      if (typeof result === 'string') {
        return {
          content: result,
          model: params.model,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
      }
      return result;
    }
    case 'anthropic':
      return callAnthropic(params);
    default:
      throw new Error('Unknown provider');
  }
} 