import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import db from '../config/db.js';

describe('Tasks API', () => {

    before(async () => {
        console.log('Setting up database...');
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    completed BOOLEAN DEFAULT false
                )
            `);
        } catch (err) {
            console.error('Error creating tasks table:', err);
        }
    });

    before(async () => {  
        console.log('Cleaning up...');
        try {
            await db.query('DELETE FROM tasks'); 
        } catch(err) {
            console.error(err);
        }
    });

    afterEach(async () => {  
        console.log('Cleaning up...');
        try {
            await db.query('DELETE FROM tasks'); 
        } catch(err) {
            console.error(err);
        }
    });

    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            let taskPayload = { title: 'Test task' };

            const res = await request(app)
                .post('/api/tasks')
                .send(taskPayload);

            expect(res.status).to.equal(201);
            expect(res.body.data).to.include({ title: 'Test task', completed: false });
        });

        it('should return an error for missing title', async () => {
            const taskPayload = {};

            const res = await request(app)
                .post('/api/tasks')
                .send(taskPayload);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error').that.contains('Title is required');
        });

    });

    describe('GET /api/tasks', () => {

        beforeEach( async () => {
            console.log('Creating new test tasks...');
            try{
                await db.query("INSERT INTO tasks (title) VALUES ('Sample Task')");
                await db.query("INSERT INTO tasks (title, completed) VALUES ('Completed Task', true)");
                await db.query("INSERT INTO tasks (title, completed) VALUES ('Uncompleted Task', false)");
            } catch(err){
                console.error(err);
            }
        });

        it('should get all tasks', async () => {
            const res = await request(app)
                .get('/api/tasks');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('data');
        });

        it('should get all completed tasks', async () => {
            const res = await request(app)
                .get('/api/tasks?completed=true');
            
            expect(res.status).to.equal(200);
            res.body.data.forEach(task => {
                expect(task.completed).to.be.true;
            });
        });

        it('should get all uncompleted tasks', async () => {
            const res = await request(app)
                .get('/api/tasks?completed=false');
            
            expect(res.status).to.equal(200);
            res.body.data.forEach(task => {
                expect(task.completed).to.be.false;
            });
        });
    });

    describe('GET /api/tasks/stats', () => {

        beforeEach( async () => {
            console.log('Creating new test tasks...');
            try{
                await db.query("INSERT INTO tasks (title) VALUES ('Sample Task')");
                await db.query("INSERT INTO tasks (title, completed) VALUES ('Completed Task', true)");
                await db.query("INSERT INTO tasks (title, completed) VALUES ('Uncompleted Task', false)");
            } catch(err){
                console.error(err);
            }
        });

        it('should get task stats', async () => {
            const res = await request(app)
                .get('/api/tasks/stats');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.have.property('completed');
            expect(res.body.data).to.have.property('uncompleted');
            expect(res.body.data.completed).to.equal(1);
            expect(res.body.data.uncompleted).to.equal(2);
        });
    });

    describe('PUT /api/tasks/:id', () => {

        it('should update a task to completed', async () => {
            let uncompletedTaskId;
            console.log('Creating a new task...');
            try{
                const uncompletedTask = await db.query("INSERT INTO tasks (title, completed) VALUES ('Uncompleted Task', false) RETURNING id");
                uncompletedTaskId = uncompletedTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${uncompletedTaskId}`)
                .set('Content-Type', 'application/json')
                .send({ completed: true });
            
                expect(res.status).to.equal(200);
                expect(res.body.data.completed).to.be.true;
        });

        it('should update a task to uncompleted', async () => {
            let completedTaskId;
            console.log('Creating a new task...');
            try {
                const completedTask = await db.query("INSERT INTO tasks (title, completed) VALUES ('Completed Task', true) RETURNING id");
                completedTaskId = completedTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${completedTaskId}`)
                .set('Content-Type', 'application/json')
                .send({ completed: false });
            
                expect(res.status).to.equal(200);
                expect(res.body.data.completed).to.be.false;
        });

        it('should return an error when updating a non-existent task', async () => {
            const res = await request(app)
                .put('/api/tasks/99999')
                .set('Content-Type', 'application/json')
                .send({ completed: true });
        
            expect(res.status).to.equal(404);
            expect(res.body.error).to.include('not found');
        });

        it('should return an error for invalid task ID', async () => {
            const res = await request(app)
                .put('/api/tasks/abc')
                .set('Content-Type', 'application/json')
                .send({ completed: true });
        
            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid task ID');
        });

        it('should return an error for invalid completed status (sending a string)', async () => {
            let taskPayload = { completed: "abc" };

            let sampleTaskId;
            console.log('Creating a new task...');
            try {
                const sampleTask = await db.query("INSERT INTO tasks (title, completed) VALUES ('Sample Task', false) RETURNING id");
                sampleTaskId = sampleTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${sampleTaskId}`)
                .set('Content-Type', 'application/json')
                .send(taskPayload);
        
            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid completed status');
        });

        it('should return an error for invalid completed status (sending numbers)', async () => {
            let taskPayload = { completed: 1 };

            let sampleTaskId;
            console.log('Creating a new task...');
            try {
                const sampleTask = await db.query("INSERT INTO tasks (title, completed) VALUES ('Sample Task', false) RETURNING id");
                sampleTaskId = sampleTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${sampleTaskId}`)
                .set('Content-Type', 'application/json')
                .send(taskPayload);
        
            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid completed status');
        });

        it('should return an error for missig completed status', async () => {
            let taskPayload = {};

            let sampleTaskId;
            console.log('Creating a new task...');
            try {
                const sampleTask = await db.query("INSERT INTO tasks (title, completed) VALUES ('Sample Task', false) RETURNING id");
                sampleTaskId = sampleTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${sampleTaskId}`)
                .set('Content-Type', 'application/json')
                .send(taskPayload);
        
            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid completed status');
        });

    });

    describe('DELETE /api/tasks/:id', () => {

        it('should delete a task', async () => {
            let sampleTaskId;
            console.log('Creating a new task...');
            try{
                const sampleTask = await db.query("INSERT INTO tasks (title) VALUES ('Sample Task') RETURNING *");
                sampleTaskId = sampleTask.rows[0].id;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .delete(`/api/tasks/${sampleTaskId}`);

            expect(res.status).to.equal(200);
        });

        it('should return an error when deleting a non-existent task', async () => {
            const res = await request(app)
                .delete('/api/tasks/99999');
        
            expect(res.status).to.equal(404);
            expect(res.body.error).to.include('not found');
        });

        it('should return an error for invalid task ID', async () => {
            const res = await request(app)
                .delete('/api/tasks/abc');
        
            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid task ID');
        });

    });
});