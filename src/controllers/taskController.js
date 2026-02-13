import { ObjectId } from 'mongodb';
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

    const task = await createTask({
      title,
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

    const updates = {};
    const unsetFields = {};

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (isCompleted !== undefined) {
      updates.isCompleted = isCompleted;
    }

    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === '') {
        unsetFields.categoryId = '';
      } else {
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

    const deleted = await deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
