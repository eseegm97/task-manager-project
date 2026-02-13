import { Router } from 'express';
import {
  addCategory,
  editCategory,
  listCategories,
  removeCategory
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

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags:
 *       - Categories
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated category
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 */
router.put('/:id', editCategory);
router.delete('/:id', removeCategory);

export default router;
