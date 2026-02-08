import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const collection = () => getDB().collection('categories');

export const createCategory = async ({ name }) => {
  const now = new Date();
  const doc = {
    name,
    createdAt: now,
    updatedAt: now
  };

  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
};

export const getCategories = async () => {
  return collection().find({}).sort({ createdAt: -1 }).toArray();
};

export const categoryExists = async (id) => {
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const count = await collection().countDocuments(
    { _id: new ObjectId(id) },
    { limit: 1 }
  );
  return count > 0;
};
