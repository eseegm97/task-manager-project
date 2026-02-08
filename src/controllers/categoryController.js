import { createCategory, getCategories } from '../models/categoryModel.js';

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
