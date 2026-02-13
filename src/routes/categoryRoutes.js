import { Router } from 'express';
import {
  addCategory,
  editCategory,
  listCategories,
  removeCategory
} from '../controllers/categoryController.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import {
  categoryCreateValidator,
  categoryIdParamValidator,
  categoryUpdateValidator
} from '../middlewares/validators.js';

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.get('/', asyncHandler(listCategories));
router.post(
  '/',
  categoryCreateValidator,
  handleValidationErrors,
  asyncHandler(addCategory)
);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.put(
  '/:id',
  categoryIdParamValidator,
  categoryUpdateValidator,
  handleValidationErrors,
  asyncHandler(editCategory)
);
router.delete(
  '/:id',
  categoryIdParamValidator,
  handleValidationErrors,
  asyncHandler(removeCategory)
);

export default router;
