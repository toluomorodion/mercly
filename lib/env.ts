import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  FLW_PUBLIC_KEY: z.string().min(1),
  FLW_SECRET_KEY: z.string().min(1),
  FLW_SECRET_HASH: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
});

const isBuild = process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE === "phase-production-build";

export const env = isBuild ? {
  DATABASE_URL: '',
  NEXTAUTH_SECRET: '',
  NEXTAUTH_URL: '',
  FLW_PUBLIC_KEY: '',
  FLW_SECRET_KEY: '',
  FLW_SECRET_HASH: '',
  RESEND_API_KEY: '',
} as z.infer<typeof envSchema> : envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  FLW_PUBLIC_KEY: process.env.FLW_PUBLIC_KEY,
  FLW_SECRET_KEY: process.env.FLW_SECRET_KEY,
  FLW_SECRET_HASH: process.env.FLW_SECRET_HASH,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
});
