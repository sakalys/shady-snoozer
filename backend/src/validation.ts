import { z } from 'zod';
import { config } from './config';
import { ClientError, Platform } from './types';

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must not exceed 100 characters')
    .trim()
    .transform((val) => val.replace(/\s+/g, ' ')), // Normalize whitespace

  description: z
    .string()
    .min(10, 'Product description must be at least 10 characters')
    .max(1000, 'Product description must not exceed 1000 characters')
    .trim()
    .transform((val) => val.replace(/\s+/g, ' ')),

  price: z
    .number()
    .positive('Product price must be positive')
    .max(999999.99, 'Product price must not exceed $999,999.99')
    .finite('Product price must be a valid number')
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places

  category: z
    .string()
    .max(50, 'Product category must not exceed 50 characters')
    .trim()
    .transform((val) => val.replace(/\s+/g, ' '))
    .optional(),
});

export const platformsSchema = z.record(
  z.nativeEnum(Platform),
  z.object({
    count: z.number().gt(0),
  }),
);

// Request body schema
export const requestBodySchema = z.object({
  product: productSchema,
  platforms: platformsSchema,
});

// Helper to format Zod errors for API response
export function formatZodErrors(error: z.ZodError) {
  return {
    message: 'Validation failed',
    code: 'validation',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  } satisfies ClientError;
}

// Validate content length for specific platforms
export function validatePlatformContent(
  content: string,
  platform: keyof typeof config.platforms,
) {
  const platformConfig = config.platforms[platform];
  if (content.length > platformConfig.maxLength) {
    throw new Error(
      `Content exceeds ${platformConfig.name} character limit (${content.length}/${platformConfig.maxLength})`,
    );
  }
  return true;
}
