import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    client = new OpenAI({
      apiKey,
      timeout: 30000, // 30 second timeout
      maxRetries: 2,
    });
  }
  
  return client;
}

export async function callOpenAI(prompt: string): Promise<string> {
  const openai = getClient();
  
  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: prompt
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