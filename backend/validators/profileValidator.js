const { body, validationResult } = require('express-validator');

const updateProfileRules = () => [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: 'Validation failed.',
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = { updateProfileRules, validate };
