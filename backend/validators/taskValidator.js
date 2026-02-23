const { body, param, validationResult } = require('express-validator');

const createTaskRules = () => [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
];

const updateTaskRules = () => [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
];

const taskIdParam = () => [param('id').isMongoId().withMessage('Invalid task ID')];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: 'Validation failed.',
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = { createTaskRules, updateTaskRules, taskIdParam, validate };
