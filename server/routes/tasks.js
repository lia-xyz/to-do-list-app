import express from 'express';
const router = express.Router();

import {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
} from '../controllers/tasks.js';

router.get('/', getTasks);

router.post('/', addTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

export default router;