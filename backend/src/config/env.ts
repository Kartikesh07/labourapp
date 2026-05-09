import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PORT',
  'JWT_SECRET'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  PORT: parseInt(process.env.PORT as string, 10),
  JWT_SECRET: process.env.JWT_SECRET as string,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};
