import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { COLLECTIONS } from '../models/collections.js';

export const listTasks = async (req, res) => {
  const { categoryId } = req.query;
  const filter = {};

  if (categoryId) {
    filter.categoryId = new ObjectId(categoryId);
  }

  const db = getDB();
  const tasks = await db
    .collection(COLLECTIONS.TASKS)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  res.status(200).json(tasks);
};

export const createTask = async (req, res) => {
  const { title, description, categoryId } = req.body;
  const db = getDB();
  let categoryRef = null;

  if (categoryId) {
    const category = await db
      .collection(COLLECTIONS.CATEGORIES)
      .findOne({ _id: new ObjectId(categoryId) });

    categoryRef = category._id;
  }

  const now = new Date();
  const task = {
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    categoryId: categoryRef,
    completed: false,
    completedAt: null,
    createdAt: now
  };

  const result = await db.collection(COLLECTIONS.TASKS).insertOne(task);

  res.status(201).json({ ...task, _id: result.insertedId });
};

export const completeTask = async (req, res) => {
  const { id } = req.params;

  const db = getDB();
  const result = await db.collection(COLLECTIONS.TASKS).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { completed: true, completedAt: new Date() } },
    { returnDocument: 'after' }
  );

  res.status(200).json(result.value);
};
