import validator from 'validator';

import db from '../config/db.js';

export const getTasks = async (req, res, next) => {
    const { completed } = req.query;

    let query = 'SELECT * FROM tasks';
    let params = [];

    if (completed !== undefined) {
        query += ' WHERE completed = $1';
        params.push(completed === 'true');
    }

    query += ' ORDER BY id';

    try {
        const tasks = await db.query(query, params);
 
        res.status(200).send({
            status: 'Success',
            message: 'Get all tasks',
            data: tasks.rows,
        });
    } catch (err) {
        return res.status(500).send({ error: 'Server error during processing your request.' });
    }
};

export const getTaskStats = async (req, res, next) => {
    const query = 'SELECT COUNT(*) FILTER (WHERE completed = true) AS completed, COUNT(*) FILTER (WHERE completed = false) AS uncompleted FROM tasks';

    try {
        const response = await db.query(query);

        const data = response.rows[0];

        res.status(200).send({
            status: 'Success',
            message: 'Get task stats',
            data: {
                completed: Number(data.completed),
                uncompleted: Number(data.uncompleted),
            },
        });
    } catch (err) {
        return res.status(500).send({ error: 'Server error during processing your request.' });
    }
};

export const addTask = async (req, res, next) => {
    const { title } = req.body;

    const trimmedTitle = title?.trim() || '';

    if (validator.isEmpty(trimmedTitle)) return res.status(400).send({ error: 'Title is required' });

    const query = 'INSERT INTO tasks (title) VALUES ($1) RETURNING *';

    try {
        const newTask = await db.query(query, [title]);
        res.status(201).send({
            status: 'Success',
            message: 'Create new task',
            data: newTask.rows[0],
        });
    } catch (err) {
        return res.status(500).send({ error: 'Server error during processing your request.' });
    }
};

export const updateTask = async (req, res, next) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (!validator.isNumeric(id, { no_symbols: true }) || parseInt(id) <= 0) {
        return res.status(400).send({ error: 'Invalid task ID' });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).send({ error: 'Invalid completed status' });
    }

    const query = 'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *';

    try {
        const updatedTask = await db.query(query, [completed, id]);

        if (updatedTask.rows.length === 0) {
            return res.status(404).send({ error: 'Task not found' });
        }

        res.status(200).send({
            status: 'Success',
            message: 'Update a task',
            data: updatedTask.rows[0],
        });
    } catch (err) {
        return res.status(500).send({ error: 'Server error during processing your request.' });
    }
};

export const deleteTask = async (req, res, next) => {
    const { id } = req.params;

    if (!validator.isNumeric(id, { no_symbols: true }) || parseInt(id) <= 0) {
        return res.status(400).send({ error: 'Invalid task ID' });
    }

    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';

    try {
        const deletedTask = await db.query(query, [id]);

        if (deletedTask.rows.length === 0) {
            return res.status(404).send({ error: 'Task not found' });
        }

        res.status(200).send({
            status: 'Success',
            message: 'Delete a task',
        });
    } catch (err) {
        return res.status(500).send({ error: 'Server error during processing your request.' });
    }
};