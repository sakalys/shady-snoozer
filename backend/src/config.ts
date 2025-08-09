import { Platform } from './types';

// TODO: take these configs into consideration
const platformConfig: Record<
  Platform,
  {
    maxLength: number;
    hashtagLimit: number;
    name: string;
  }
> = {
  [Platform.X]: {
    maxLength: 280,
    hashtagLimit: 3,
    name: 'Twitter/X',
  },
  [Platform.Instagram]: {
    maxLength: 2200,
    hashtagLimit: 30,
    name: 'Instagram',
  },
  [Platform.Linkedin]: {
    maxLength: 3000,
    hashtagLimit: 5,
    name: 'LinkedIn',
  },
};

export const config = {
  platforms: platformConfig,

  generation: {
    model: 'gpt-4o',
    temperature: 0.8,
    // TODO: handle max tokens
    maxTokens: 1000,
  },

  api: {
    timeout: 30000,
    retries: 2,
  },
} as const;

