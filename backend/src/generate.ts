import { callOpenAI } from './openai';
import { Product, SocialMediaPost, Platform } from './types';

const PLATFORMS: Platform[] = ['twitter', 'instagram', 'linkedin'];
const POST_COUNT = 5;

export async function generateSocialMediaPosts(product: Product): Promise<SocialMediaPost[]> {
  const prompt = buildPrompt(product);
  
  try {
    const response = await callOpenAI(prompt);
    const posts = parseResponse(response);
    
    if (posts.length === 0) {
      return [
        {
          platform: 'twitter',
          content: `🚀 Introducing ${product.name}! ${product.description.slice(0, 100)}... Get yours for just $${product.price}! #Innovation`
        },
        {
          platform: 'instagram',
          content: `✨ ${product.name} is here! ${product.description} 💫 Link in bio to get yours! #${product.category?.replace(/\s+/g, '') || 'NewProduct'}`
        },
        {
          platform: 'linkedin',
          content: `Excited to announce ${product.name}! ${product.description} Learn more about how this can transform your workflow.`
        }
      ];
    }
    
    return posts;
  } catch (error) {
    console.error('Error generating posts:', error);
    throw new Error('Failed to generate social media posts');
  }
}

function buildPrompt(product: Product): string {
  return `Generate ${POST_COUNT} social media posts for this product:

Product: ${product.name}
Description: ${product.description}
Price: $${product.price}
${product.category ? `Category: ${product.category}` : ''}

Format each post as:
Platform: Content

Include posts for Twitter, Instagram, and LinkedIn. Use emojis and make them engaging.`;
}

function parseResponse(response: string): SocialMediaPost[] {
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed.filter(post => 
        post.platform && 
        post.content && 
        PLATFORMS.includes(post.platform.toLowerCase())
      ).map(post => ({
        platform: post.platform.toLowerCase() as Platform,
        content: post.content
      }));
    }
  } catch (e) {
    // Not JSON, continue with text parsing
  }
  
  const posts: SocialMediaPost[] = [];
  const sections = response.split('---').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(l => l);
    
    let platform: Platform | null = null;
    let content = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      const platformMatch = line.match(/\*?\*?Platform:\s*(twitter|instagram|linkedin)\*?\*?/i);
      if (platformMatch) {
        platform = platformMatch[1].toLowerCase() as Platform;
        const sameLineContent = line.split(platformMatch[0])[1]?.trim();
        if (sameLineContent) {
          content = sameLineContent;
        } else if (i + 1 < lines.length) {
          content = lines[i + 1];
        }
        break;
      }
    }
    
    if (platform && content && PLATFORMS.includes(platform)) {
      posts.push({ platform, content });
    }
  }
  
  if (posts.length === 0) {
    const lines = response.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      const patterns = [
        /^(twitter|instagram|linkedin):\s*(.+)$/i,
        /^\*?\*?(twitter|instagram|linkedin)\*?\*?:\s*(.+)$/i,
        /^Platform:\s*(twitter|instagram|linkedin)\s*-?\s*(.+)$/i
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const platform = match[1].toLowerCase() as Platform;
          let content = match[2].trim();
          
          if (!content && i + 1 < lines.length) {
            content = lines[i + 1].trim();
          }
          
          if (content && PLATFORMS.includes(platform)) {
            posts.push({ platform, content });
            break;
          }
        }
      }
    }
  }
  
  return posts;
}