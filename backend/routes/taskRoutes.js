const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const {
  createTaskRules,
  updateTaskRules,
  taskIdParam,
  validate,
} = require('../validators/taskValidator');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { userId: req.user._id };
    if (status && ['todo', 'in_progress', 'done'].includes(status)) {
      filter.status = status;
    }
    let query = Task.find(filter).sort({ createdAt: -1 });
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query = query.find({ $or: [{ title: regex }, { description: regex }] });
    }
    const tasks = await query.lean();
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', ...createTaskRules(), validate, async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', ...taskIdParam(), validate, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', ...updateTaskRules(), validate, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', ...taskIdParam(), validate, async (req, res, next) => {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
