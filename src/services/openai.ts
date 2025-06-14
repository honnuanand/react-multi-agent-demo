import OpenAI from 'openai';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type LLMProvider = 'openai' | 'anthropic' | 'databricks';

export interface CallLLMParams {
  provider: LLMProvider;
  messages: AgentMessage[];
  model: string;
  apiKey?: string;
  apiUrl?: string; // for databricks
}

let openaiClient: OpenAI | null = null;

export async function callLLM({ provider, messages, model, apiKey, apiUrl }: CallLLMParams): Promise<{ content: string; model: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  if (provider === 'openai') {
    const body: any = {
      messages,
      model,
      provider,
      apiUrl: apiUrl || 'https://api.openai.com/v1/chat/completions',
    };
    const response = await fetch('/api/llm/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    }
    return {
      content: data.content || 'No response from OpenAI',
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }
  // Placeholder for other providers
  if (provider === 'anthropic') {
    throw new Error('Anthropic support not yet implemented.');
  }
  if (provider === 'databricks') {
    throw new Error('Databricks support not yet implemented.');
  }
  throw new Error(`Unknown provider: ${provider}`);
}

// Prompts can remain here for now, or move to agents
export const AGENT_PROMPTS = {
  planner: `You are a planning agent responsible for breaking down tasks into actionable steps.\nYour goal is to create clear, logical, and efficient plans that can be executed by other agents.\nFocus on identifying key objectives, dependencies, and potential challenges.\nFormat your response in a clear, structured manner.\n\nIMPORTANT: Always include a suggested article title and 3-5 section subtitles in your plan.`,

  researcher: `You are a research agent responsible for gathering and synthesizing information.\nYour goal is to provide comprehensive, accurate, and relevant information to support content creation.\nFocus on finding credible sources, key facts, and important context.\nFormat your response in a clear, organized manner with proper citations where applicable.\n\nIMPORTANT: Suggest a title and section subtitles for the article based on your research.`,

  writer: `You are a writing agent responsible for creating engaging and informative content.\nYour goal is to transform research and plans into well-structured, compelling content.\nFocus on clarity, flow, and maintaining a consistent voice throughout the piece.\nFormat your response in a professional, polished manner with proper paragraphs and structure.\n\nIMPORTANT: Begin your output with a title and section subtitles, then write the content for each section.`,

  reviewer: `You are a review agent responsible for providing constructive feedback on content.\nYour goal is to ensure the content meets quality standards and effectively communicates its message.\nFocus on identifying areas for improvement in clarity, accuracy, structure, and style.\nFormat your feedback in a clear, actionable manner with specific suggestions for improvement.`
}; 