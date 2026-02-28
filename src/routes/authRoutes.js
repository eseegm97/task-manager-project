import { Router } from 'express';
import {
  githubAuthorize,
  githubExchange,
  refreshTokens
} from '../controllers/authController.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import {
  githubExchangeValidator,
  refreshTokenValidator
} from '../middlewares/validators.js';

const router = Router();

router.get('/github/authorize', githubAuthorize);
router.post(
  '/github/exchange',
  githubExchangeValidator,
  handleValidationErrors,
  asyncHandler(githubExchange)
);
router.post(
  '/refresh',
  refreshTokenValidator,
  handleValidationErrors,
  asyncHandler(refreshTokens)
);

export default router;
