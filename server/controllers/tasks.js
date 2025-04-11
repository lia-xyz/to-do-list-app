const db = require('../config/db.js');

exports.getTasks = async (req, res, next) => {
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
        if(tasks.rowCount < 1) {
            return res.status(404).send({
                message: 'Tasks not found'
            });
        }
        res.status(200).json({
            status: 'Success',
            message: 'Tasks retrieved',
            data: tasks.rows,
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};

exports.addTask = async (req, res, next) => {
    const { title } = req.body;
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

exports.updateTask = async (req, res, next) => {
    const { id } = req.params;
    const query = 'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *';

    try {
        const updatedTask = await db.query(query, [id]);
        res.status(200).send({
            status: 'Success',
            message: 'Task updated',
            data: updatedTask.rows[0],
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};

exports.deleteTask = async (req, res, next) => {
    const { id } = req.params;
    const tasksQuery = 'SELECT * FROM tasks WHERE id = $1';
    const query = 'DELETE FROM tasks WHERE id = $1';

    try {
        const record = await db.query(tasksQuery, [id]);
        if (record.rowCount < 1) {
            return res.status(404).send({
                message: 'Record not found'
            });
        }

        await db.query(query, [id]);
        res.status(204).send({
            status: 'Success',
            message: 'Task deleted',
        });
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};