import { body, param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { categoryExists } from '../models/categoryModel.js';

const objectIdParam = (name, label) =>
  param(name).custom((value) => {
    if (!ObjectId.isValid(value)) {
      throw new Error(`${label} must be a valid ObjectId.`);
    }
    return true;
  });

const trimmedRequiredString = (name, requiredMessage, invalidMessage) =>
  body(name)
    .customSanitizer((value) => (typeof value === 'string' ? value.trim() : value))
    .custom((value) => {
      if (value === undefined) {
        throw new Error(requiredMessage);
      }
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(invalidMessage);
      }
      return true;
    });

const trimmedOptionalString = (name, invalidMessage) =>
  body(name)
    .optional()
    .customSanitizer((value) => (typeof value === 'string' ? value.trim() : value))
    .custom((value) => {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(invalidMessage);
      }
      return true;
    });

const optionalString = (name, message) =>
  body(name)
    .optional()
    .isString()
    .withMessage(message);

const optionalBoolean = (name, message) =>
  body(name)
    .optional()
    .isBoolean({ strict: true })
    .withMessage(message);

const optionalCategoryId = body('categoryId')
  .optional({ nullable: true })
  .custom(async (value) => {
    if (value === null || value === '') {
      return true;
    }

    if (!ObjectId.isValid(value)) {
      throw new Error('categoryId must be a valid ObjectId.');
    }

    const exists = await categoryExists(value);
    if (!exists) {
      throw new Error('Category not found.');
    }

    return true;
  });

export const taskCreateValidator = [
  trimmedRequiredString('title', 'Title is required.', 'Title is required.'),
  optionalString('description', 'Description must be a string.'),
  optionalBoolean('isCompleted', 'isCompleted must be a boolean.'),
  optionalCategoryId
];

export const taskUpdateValidator = [
  trimmedOptionalString('title', 'Title must be a non-empty string.'),
  optionalString('description', 'Description must be a string.'),
  optionalBoolean('isCompleted', 'isCompleted must be a boolean.'),
  optionalCategoryId
];

export const taskIdParamValidator = [objectIdParam('id', 'Task id')];

export const categoryCreateValidator = [
  trimmedRequiredString('name', 'Name is required.', 'Name is required.')
];

export const categoryUpdateValidator = [
  trimmedRequiredString('name', 'Name is required.', 'Name must be a non-empty string.')
];

export const categoryIdParamValidator = [objectIdParam('id', 'Category id')];
