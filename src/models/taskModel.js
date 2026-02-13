import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const collection = () => getDB().collection('tasks');

export const createTask = async ({
  title,
  description,
  categoryId,
  isCompleted
}) => {
  const now = new Date();
  const doc = {
    title,
    description: description || '',
    isCompleted: Boolean(isCompleted),
    createdAt: now,
    updatedAt: now
  };

  if (categoryId) {
    doc.categoryId = new ObjectId(categoryId);
  }

  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
};

export const getTasks = async () => {
  return collection().find({}).sort({ createdAt: -1 }).toArray();
};

export const updateTask = async (id, updateDoc) => {
  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    updateDoc,
    { returnDocument: 'after' }
  );

  return result.value;
};

export const deleteTask = async (id) => {
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};
