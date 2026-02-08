import { getDB } from '../config/db.js';
import { COLLECTIONS } from '../models/collections.js';

export const listCategories = async (req, res) => {
  const db = getDB();
  const categories = await db
    .collection(COLLECTIONS.CATEGORIES)
    .find({})
    .sort({ name: 1 })
    .toArray();

  res.status(200).json(categories);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;

  const db = getDB();
  const now = new Date();
  const trimmedName = name.trim();
  const result = await db.collection(COLLECTIONS.CATEGORIES).insertOne({
    name: trimmedName,
    createdAt: now
  });

  res.status(201).json({
    _id: result.insertedId,
    name: trimmedName,
    createdAt: now
  });
};
