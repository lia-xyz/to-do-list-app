import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import db from '../config/db.js';

describe('Tasks API', () => {

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
            expect(res.body).to.have.property('message').that.contains('Title is required');
        });

    });

    describe('GET /api/tasks', () => {

        beforeEach( async () => {            console.log('Creating new test tasks...');
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

    describe('PUT /api/tasks/:id', () => {

        it('should toggle a task', async () => {
            let sampleTaskId;
            let sampleTaskInitialCompletedStatus;
            console.log('Creating a new task...');
            try{
                const sampleTask = await db.query("INSERT INTO tasks (title) VALUES ('Sample Task') RETURNING *");
                sampleTaskId = sampleTask.rows[0].id;
                sampleTaskInitialCompletedStatus = sampleTask.rows[0].completed;
            } catch (err) {
                console.error(err);
            }

            const res = await request(app)
                .put(`/api/tasks/${sampleTaskId}`);
            
                expect(res.status).to.equal(200);
                expect(res.body.data.completed).to.not.equal(sampleTaskInitialCompletedStatus);
        });

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
                .put(`/api/tasks/${uncompletedTaskId}`);
            
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
                .put(`/api/tasks/${completedTaskId}`);
            
                expect(res.status).to.equal(200);
                expect(res.body.data.completed).to.be.false;
        });

        it('should return an error when updating a non-existent task', async () => {
            const res = await request(app)
                .put('/api/tasks/99999');
        
            expect(res.status).to.equal(404);
            expect(res.body.message).to.include('not found');
        });

        it('should return an error for invalid task ID', async () => {
            const res = await request(app)
                .put('/api/tasks/abc');
        
            expect(res.status).to.equal(400);
            expect(res.body.message).to.include('Invalid task ID');
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

            expect(res.status).to.equal(204);
        });

        it('should return an error when deleting a non-existent task', async () => {
            const res = await request(app)
                .delete('/api/tasks/99999');
        
            expect(res.status).to.equal(404);
            expect(res.body.message).to.include('not found');
        });

        it('should return an error for invalid task ID', async () => {
            const res = await request(app)
                .delete('/api/tasks/abc');
        
            expect(res.status).to.equal(400);
            expect(res.body.message).to.include('Invalid task ID');
        });

    });
});