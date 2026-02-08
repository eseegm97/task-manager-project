import dotenv from 'dotenv';

dotenv.config();

export const {
  NODE_ENV,
  PORT,
  MONGO_URI,
  DB_NAME
} = process.env;
