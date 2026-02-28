import jwt from 'jsonwebtoken';
import { JWT_ISSUER, JWT_SECRET } from '../config/env.js';

const ensureJwtSecret = () => {
  if (!JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured.');
    error.status = 500;
    throw error;
  }
};

export const authenticate = (req, res, next) => {
  try {
    ensureJwtSecret();

    const header = req.get('authorization');
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing.' });
    }

    const token = header.slice('bearer '.length).trim();
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER || 'task-manager'
    });

    if (payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid access token.' });
    }

    req.user = {
      id: payload.sub,
      provider: payload.provider
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
};
