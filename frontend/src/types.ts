export interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export interface PlatformRequest {
  count: number;
}

export type Platforms = Partial<Record<Platform, PlatformRequest>>;

export enum Platform {
  X = 'x',
  Instagram = 'instagram',
  Linkedin = 'linkedin',
}
