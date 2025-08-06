export interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export type Platform = 'twitter' | 'instagram' | 'linkedin';

export interface SocialMediaPost {
  platform: Platform;
  content: string;
}

export interface ClientError {
    message: string
    code: string
    details: {
        field: string
        message: string
    }[]
}
