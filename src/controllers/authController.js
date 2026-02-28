import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_TTL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
  JWT_ISSUER,
  JWT_SECRET,
  REFRESH_TOKEN_TTL
} from '../config/env.js';
import { upsertGithubUser } from '../models/userModel.js';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';
const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '30d';

const ensureGithubConfig = () => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
    const error = new Error('GitHub OAuth is not configured.');
    error.status = 500;
    throw error;
  }
};

const ensureJwtSecret = () => {
  if (!JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured.');
    error.status = 500;
    throw error;
  }
};

const createTokens = (userId, provider) => {
  const issuer = JWT_ISSUER || 'task-manager';
  const accessToken = jwt.sign(
    { type: 'access', provider },
    JWT_SECRET,
    {
      subject: userId,
      issuer,
      expiresIn: ACCESS_TOKEN_TTL || DEFAULT_ACCESS_TTL
    }
  );

  const refreshToken = jwt.sign(
    { type: 'refresh', provider },
    JWT_SECRET,
    {
      subject: userId,
      issuer,
      expiresIn: REFRESH_TOKEN_TTL || DEFAULT_REFRESH_TTL
    }
  );

  return { accessToken, refreshToken };
};

const fetchGithubUser = async (githubAccessToken) => {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${githubAccessToken}`,
      'User-Agent': 'task-manager-project'
    }
  });

  if (!response.ok) {
    const error = new Error('Failed to fetch GitHub profile.');
    error.status = 502;
    throw error;
  }

  return response.json();
};

const fetchGithubEmail = async (githubAccessToken) => {
  const response = await fetch(GITHUB_EMAILS_URL, {
    headers: {
      Authorization: `Bearer ${githubAccessToken}`,
      'User-Agent': 'task-manager-project'
    }
  });

  if (!response.ok) {
    return null;
  }

  const emails = await response.json();
  if (!Array.isArray(emails)) {
    return null;
  }

  const primary = emails.find((email) => email.primary && email.verified);
  return primary?.email || null;
};

export const githubAuthorize = (req, res, next) => {
  try {
    ensureGithubConfig();

    const { code_challenge: codeChallenge, state } = req.query;

    if (!codeChallenge || !state) {
      return res.status(400).json({
        message: 'code_challenge and state are required.'
      });
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return res.redirect(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
  } catch (error) {
    return next(error);
  }
};

export const githubExchange = async (req, res, next) => {
  try {
    ensureGithubConfig();
    ensureJwtSecret();

    const { code, codeVerifier } = req.body;

    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        redirect_uri: GITHUB_REDIRECT_URI,
        code,
        code_verifier: codeVerifier
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      const error = new Error(tokenData.error_description || 'OAuth exchange failed.');
      error.status = 502;
      throw error;
    }

    const githubAccessToken = tokenData.access_token;
    const githubUser = await fetchGithubUser(githubAccessToken);
    if (!githubUser?.id || !githubUser?.login) {
      const error = new Error('GitHub profile is missing required fields.');
      error.status = 502;
      throw error;
    }
    const email = githubUser.email || (await fetchGithubEmail(githubAccessToken));

    const user = await upsertGithubUser({
      providerUserId: String(githubUser.id),
      username: githubUser.login,
      email,
      avatarUrl: githubUser.avatar_url
    });

    if (!user?._id) {
      const error = new Error('Unable to create or load the GitHub user.');
      error.status = 502;
      throw error;
    }

    const { accessToken, refreshToken } = createTokens(
      user._id.toString(),
      'github'
    );

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshTokens = (req, res, next) => {
  try {
    ensureJwtSecret();

    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, JWT_SECRET, {
      issuer: JWT_ISSUER || 'task-manager'
    });

    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = createTokens(
      payload.sub,
      payload.provider
    );

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    return next(error);
  }
};
