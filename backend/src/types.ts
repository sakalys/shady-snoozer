import z from "zod";
import { platformsSchema, productSchema } from "./validation";

export enum Platform {
  X = 'x',
  Instagram = 'instagram',
  Linkedin = 'linkedin',
}

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

export type PlatformRequest = { count: number };

export type Product = z.infer<typeof productSchema>;
export type Platforms = z.infer<typeof platformsSchema>;

