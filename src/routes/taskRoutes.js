import { Router } from 'express';
import { addTask, editTask, listTasks, removeTask } from '../controllers/taskController.js';

const router = Router();

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: List tasks
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: A list of tasks
 *   post:
 *     summary: Create a task
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: The created task
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 */
router.get('/', listTasks);
router.post('/', addTask);

/**
 * @openapi
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated task
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or category not found
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
router.put('/:id', editTask);
router.delete('/:id', removeTask);

export default router;
