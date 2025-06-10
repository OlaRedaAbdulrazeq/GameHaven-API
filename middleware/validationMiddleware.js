import { body, param, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validationRules = {
  getOrder: [param('id').isMongoId().withMessage('Invalid order ID format')],
};

const validate = (ruleName) => {
  return async (req, res, next) => {
    const rules = validationRules[ruleName];
    if (!rules) return next();

    await Promise.all(rules.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    next(new ApiError(400, errorMessages));
  };
};

export default validate;
