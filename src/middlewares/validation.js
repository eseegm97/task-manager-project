import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.param,
    message: error.msg
  }));

  return res.status(400).json({ message: 'Validation failed.', errors });
};
