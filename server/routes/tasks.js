import express from 'express';
const router = express.Router();

import {
    getTasks,
    getTaskStats,
    addTask,
    updateTask,
    deleteTask,
} from '../controllers/tasks.js';

router.get('/', getTasks);

router.get('/stats', getTaskStats);

router.post('/', addTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

export default router;