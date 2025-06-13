import OpenAI from 'openai';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const AGENT_PROMPTS = {
  planner: `You are a planning agent responsible for breaking down tasks into actionable steps.
Your goal is to create clear, logical, and efficient plans that can be executed by other agents.
Focus on identifying key objectives, dependencies, and potential challenges.
Format your response in a clear, structured manner.

IMPORTANT: Always include a suggested article title and 3-5 section subtitles in your plan.`,

  researcher: `You are a research agent responsible for gathering and synthesizing information.
Your goal is to provide comprehensive, accurate, and relevant information to support content creation.
Focus on finding credible sources, key facts, and important context.
Format your response in a clear, organized manner with proper citations where applicable.

IMPORTANT: Suggest a title and section subtitles for the article based on your research.`,

  writer: `You are a writing agent responsible for creating engaging and informative content.
Your goal is to transform research and plans into well-structured, compelling content.
Focus on clarity, flow, and maintaining a consistent voice throughout the piece.
Format your response in a professional, polished manner with proper paragraphs and structure.

IMPORTANT: Begin your output with a title and section subtitles, then write the content for each section.`,

  reviewer: `You are a review agent responsible for providing constructive feedback on content.
Your goal is to ensure the content meets quality standards and effectively communicates its message.
Focus on identifying areas for improvement in clarity, accuracy, structure, and style.
Format your feedback in a clear, actionable manner with specific suggestions for improvement.`
};

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
  });
}

export async function callOpenAI(messages: AgentMessage[]): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please configure your API key first.');
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || 'No response from OpenAI';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from OpenAI. Please check your API key and try again.');
  }
} 