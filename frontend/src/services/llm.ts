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
  maxTokens?: number;
  temperature?: number;
  apiUrl?: string;
  apiKey?: string;
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
      const result = await callOpenAI({ ...params });
      if (typeof result === 'string') {
        return {
          content: result,
          model: params.model,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
      }
      return {
        content: result.content,
        model: result.model,
        usage: result.usage
      };
    }
    case 'databricks': {
      const result = await callDatabricks({ ...params });
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