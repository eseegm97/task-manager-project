import { Router } from 'express';
import { addTask, listTasks } from '../controllers/taskController.js';

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

export default router;
