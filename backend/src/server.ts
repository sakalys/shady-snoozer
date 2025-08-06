import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateSocialMediaPosts } from './generate';
import { Product } from './types';

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
    const product: Product = req.body.product;
    
    // Basic validation
    if (!product || !product.name || !product.description) {
      return res.status(400).json({ 
        error: 'Missing required fields: name and description are required' 
      });
    }
    
    if (typeof product.price !== 'number' || product.price < 0) {
      return res.status(400).json({ 
        error: 'Invalid price: must be a positive number' 
      });
    }
    
    const posts = await generateSocialMediaPosts(product);
    
    res.json({ 
      posts,
      generated_at: new Date().toISOString(),
      count: posts.length
    });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    
    res.status(500).json({ 
      error: 'Failed to generate posts. Please try again later.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not found in environment variables');
  }
});