import { ObjectId } from 'mongodb';
import { categoryExists } from '../models/categoryModel.js';
import { createTask, getTasks } from '../models/taskModel.js';

export const listTasks = async (req, res, next) => {
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const addTask = async (req, res, next) => {
  try {
    const { title, description, categoryId, isCompleted } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (categoryId) {
      if (!ObjectId.isValid(categoryId)) {
        return res
          .status(400)
          .json({ message: 'categoryId must be a valid ObjectId.' });
      }

      const exists = await categoryExists(categoryId);
      if (!exists) {
        return res.status(404).json({ message: 'Category not found.' });
      }
    }

    const task = await createTask({
      title: title.trim(),
      description,
      categoryId,
      isCompleted
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};
