import dotenv from 'dotenv';

dotenv.config();

export const {
  NODE_ENV,
  PORT,
  MONGO_URI,
  DB_NAME,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
  JWT_SECRET,
  JWT_ISSUER,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL
} = process.env;
