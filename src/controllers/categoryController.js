import { ObjectId } from 'mongodb';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '../models/categoryModel.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const category = await createCategory({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: 'Category id must be a valid ObjectId.' });
    }

    if (name === undefined) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name must be a non-empty string.' });
    }

    const updateDoc = {
      $set: {
        name: name.trim(),
        updatedAt: new Date()
      }
    };

    const category = await updateCategory(id, updateDoc);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const removeCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: 'Category id must be a valid ObjectId.' });
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
