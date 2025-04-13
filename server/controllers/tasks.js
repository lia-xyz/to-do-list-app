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
 
        res.status(200).json({
            status: 'Success',
            message: 'Tasks retrieved',
            data: tasks.rows,
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};

export const addTask = async (req, res, next) => {
    const { title } = req.body;

    if (!title) return res.status(400).send({status: 'Bad request', message: 'Title is required'});

    const query = 'INSERT INTO tasks (title) VALUES ($1) RETURNING *';

    try {
        const newTask = await db.query(query, [title]);
        res.status(201).send({
            status: 'Success',
            message: 'New task created',
            data: newTask.rows[0],
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};

export const updateTask = async (req, res, next) => {
    const { id } = req.params;

    if (!validator.isNumeric(id, { no_symbols: true }) || parseInt(id) <= 0) {
        return res.status(400).send({
            status: 'Bad Request',
            message: 'Invalid task ID',
        });
    }

    const query = 'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *';

    try {
        const updatedTask = await db.query(query, [id]);

        if (updatedTask.rows.length === 0) {
            return res.status(404).send({
                status: 'Not Found',
                message: `Task with this ${id} not found`,
            });
        }

        res.status(200).send({
            status: 'Success',
            message: 'Task updated',
            data: updatedTask.rows[0],
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};

export const deleteTask = async (req, res, next) => {
    const { id } = req.params;

    if (!validator.isNumeric(id, { no_symbols: true }) || parseInt(id) <= 0) {
        return res.status(400).send({
            status: 'Bad Request',
            message: 'Invalid task ID',
        });
    }

    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';

    try {
        const deletedTask = await db.query(query, [id]);

        if (deletedTask.rows.length === 0) {
            return res.status(404).send({
                status: 'Not Found',
                message: `Task with ID ${id} not found`,
            });
        }

        res.status(204).send({
            status: 'Success',
            message: 'Task deleted',
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};