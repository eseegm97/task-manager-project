import { ObjectId } from 'mongodb';
import { categoryExists } from '../models/categoryModel.js';
import { createTask, deleteTask, getTasks, updateTask } from '../models/taskModel.js';

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

export const editTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, isCompleted } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Task id must be a valid ObjectId.' });
    }

    const updates = {};
    const unsetFields = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Title must be a non-empty string.' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string.' });
      }
      updates.description = description;
    }

    if (isCompleted !== undefined) {
      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({ message: 'isCompleted must be a boolean.' });
      }
      updates.isCompleted = isCompleted;
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === '') {
        unsetFields.categoryId = '';
      } else {
        if (!ObjectId.isValid(categoryId)) {
          return res
            .status(400)
            .json({ message: 'categoryId must be a valid ObjectId.' });
        }

        const exists = await categoryExists(categoryId);
        if (!exists) {
          return res.status(404).json({ message: 'Category not found.' });
        }

        updates.categoryId = new ObjectId(categoryId);
      }
    }

    if (Object.keys(updates).length === 0 && Object.keys(unsetFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    updates.updatedAt = new Date();

    const updateDoc = { $set: updates };
    if (Object.keys(unsetFields).length > 0) {
      updateDoc.$unset = unsetFields;
    }

    const task = await updateTask(id, updateDoc);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const removeTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Task id must be a valid ObjectId.' });
    }

    const deleted = await deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
