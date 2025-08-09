import { z } from 'zod';
import { callOpenAI } from './openai';
import { Product, SocialMediaPost, Platform, Platforms } from './types';
import { config } from './config';

const zPostResponse = z.object({
  platform: z.nativeEnum(Platform),
  post: z.string(),
});

const postsResponseSchema = z.object({
  array: z.array(zPostResponse),
});

type PostsResponse = z.infer<typeof postsResponseSchema>;

const instructions = `
You are in the industry of social media content writing for over 10 years, and by now you already know all of the best practices and are a world-class professional.

You excel at writing social media posts for various social media platforms. The ones you have expertise in are:
${Object.values(config.platforms)
  .map((item) => `- ${item.name}`)
  .join('\n')}
`;

export async function generateSocialMediaPosts(
  product: Product,
  platforms: Platforms,
): Promise<SocialMediaPost[]> {
  const prompt = buildPrompt(product, platforms);

  try {
    const response = await callOpenAI(prompt, instructions, [
      postsResponseSchema,
      'posts',
    ]);

    return parseResponse(response);
  } catch (error) {
    console.error('Error generating posts:', error);
    throw new Error('Failed to generate social media posts');
  }
}

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const platformTemplate = (platform: Platform, opts: { count: number }) =>
  `  <Platform>
    <Name>${config.platforms[platform].name}</Name>
    <PostCount>${opts.count}</PostCount>
    <HashtagLimit>${config.platforms[platform].hashtagLimit}</HashtagLimit>
  </Platform>`;

function buildPrompt(product: Product, platforms: Platforms): string {
  if (Object.keys(platforms).length === 0) {
    throw new Error('Must provide at least one platfrom');
  }

  return `Generate social media posts for this product:

<Product>
  <Name>${escapeHtml(product.name)}</Name>
  <Description>${escapeHtml(product.description)}</Description>
  <Price>$${product.price}</Price>
  ${product.category ? `<Category>${product.category}</Category>` : ''}
</Product>

Create posts for the following platfroms:

<Platforms>
${Object.entries(platforms)
  .map(([key, opts]) => platformTemplate(key as Platform, opts))
  .join('\n')}
</Platforms>


Use emojis and make them engaging.`;
}

function parseResponse(response: string): SocialMediaPost[] {
  try {
    const parsed: PostsResponse = JSON.parse(response);

    return parsed.array.map((post) => ({
      ...post,
      content: post.post,
    }));
  } catch (e) {
    throw Error('Expecting structured output. error received instead', {
      cause: e,
    });
  }
}
