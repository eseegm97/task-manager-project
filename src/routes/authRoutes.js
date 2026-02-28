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

/**
 * @openapi
 * /api/auth/github/authorize:
 *   get:
 *     summary: Begin GitHub OAuth flow
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code_challenge
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to GitHub for authorization
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: OAuth configuration error
 */
router.get('/github/authorize', githubAuthorize);

/**
 * @openapi
 * /api/auth/github/exchange:
 *   post:
 *     summary: Exchange GitHub OAuth code for tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - codeVerifier
 *             properties:
 *               code:
 *                 type: string
 *               codeVerifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens and user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 tokenType:
 *                   type: string
 *                   example: Bearer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       502:
 *         description: OAuth exchange failed
 */
router.post(
  '/github/exchange',
  githubExchangeValidator,
  handleValidationErrors,
  asyncHandler(githubExchange)
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 tokenType:
 *                   type: string
 *                   example: Bearer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh',
  refreshTokenValidator,
  handleValidationErrors,
  asyncHandler(refreshTokens)
);

export default router;
