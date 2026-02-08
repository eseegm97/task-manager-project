import { Router } from 'express';
import {
  addCategory,
  listCategories
} from '../controllers/categoryController.js';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: A list of categories
 *   post:
 *     summary: Create a category
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created category
 *       400:
 *         description: Validation error
 */
router.get('/', listCategories);
router.post('/', addCategory);

export default router;
