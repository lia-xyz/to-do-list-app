const express = require('express');
const router = express.Router();

const {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
} = require('../controllers/tasks.js');

router.get('/', getTasks);

router.post('/', addTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;