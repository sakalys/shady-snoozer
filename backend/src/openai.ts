import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { AnyZodObject } from 'zod';
import { config } from './config';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    client = new OpenAI({
      apiKey,
      timeout: config.api.timeout,
      maxRetries: config.api.retries,
    });
  }

  return client;
}
/**
 * @param format first item is the format and the second one is the name for the format
 */
export async function callOpenAI(
  prompt: string,
  instructions: string,
  format: [AnyZodObject, string],
): Promise<string> {
  const openai = getClient();

  try {
    const response = await openai.responses.create({
      model: config.generation.model,
      temperature: config.generation.temperature,
      max_output_tokens: config.generation.maxTokens,
      input: prompt,
      instructions,
      text: {
        format: zodTextFormat(format[0], format[1]),
      },
    });

    if (!response.output_text) {
      throw new Error('Empty response from OpenAI');
    }

    return response.output_text;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
      });

      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      }
    }

    throw error;
  }
}
