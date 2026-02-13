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

    const category = await createCategory({ name });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updateDoc = {
      $set: {
        name,
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

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
