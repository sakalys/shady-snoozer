import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateSocialMediaPosts } from './generate';
import { requestBodySchema, formatZodErrors } from './validation';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate social media posts
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const validationResult = requestBodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(422).json(formatZodErrors(validationResult.error));
    }

    const { product, platforms } = validationResult.data;

    const posts = await generateSocialMediaPosts(
      product,
      platforms,
    );

    res.json({
      posts,
    });
  } catch (error) {
    console.error('Error in /api/generate:', error);

    res.status(500).json({
      error: 'Failed to generate posts. Please try again later.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not found in environment variables');
  }
});
