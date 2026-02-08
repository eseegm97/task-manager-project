import { MongoClient } from 'mongodb';
import { MONGO_URI, DB_NAME } from './env.js';

let client;
let db;

export const connectDB = async () => {
  if (db) return db;

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();

    db = client.db(DB_NAME);
    console.log('MongoDB connected');

    return db;
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export default connectDB;
