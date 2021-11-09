'use strict';

process.env.SECRET = `guava${Math.random() * 1000}`;

const supertest = require('supertest');
const { server } = require('../src/server');
const { db } = require('../src/models/index');
const mockRequest = supertest(server);
let users = {
    admin: { username: 'admin', password: 'password', role: 'admin' },
    editor: { username: 'editor', password: 'password', role: 'editor' },
    writer: { username: 'writer', password: 'password', role: 'writer' },
    user: { username: 'user', password: 'password', role: 'user' },
};

beforeAll(async () => {
    await db.sync();
});
afterAll(async () => {
    await db.drop();
});

describe('V2 Test', () => {
    Object.keys(users).forEach(userType => {
        describe(`${userType} users`, () => {
            it('create new record', async () => {
                const register = await mockRequest.post('/signup').send(users[userType]);
                const token = register.body.token;
                const response = await mockRequest.post('/api/v1/food').send({
                    "name": "hassan",
                    "calories": "221",
                    "type": "fruit"
                }).set("Authorization", `Bearer ${token}`);
                if (userType === 'user') {
                    expect(response.status).not.toBe(201);
                } else {
                    expect(response.status).toBe(201);
                }
            });
            it('get all records', async () => {
                const register = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
                const token = register.body.token;
                await mockRequest.put('/api/v1/food').send({
                    "name": "hassan",
                    "calories": "221",
                    "type": "fruit"
                }).set('Authorization', `Bearer admin`);
                const response = await mockRequest.get('/api/v1/food').set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(200);
            });
            it('get one record', async () => {
                const register = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
                const token = register.body.token;
                const response = await mockRequest.get('/api/v1/food/1').set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(200);
            });
            it('update record', async () => {
                const register = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
                const token = register.body.token;
                const response = await mockRequest.put('/api/v1/food/1').send({
                    "name": "hassan",
                    "calories": "300",
                    "type": "fruit"
                }).set('Authorization', `Bearer ${token}`);
                if (users[userType].role === 'admin' || users[userType].role === 'editor') {
                    expect(response.status).toBe(201);
                } else {
                    expect(response.status).not.toBe(201);
                }
            });
            if ('delete record', async () => {
                const register = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
                const token = register.body.token;
                const response = await mockRequest.delete('/api/v1/food/1').set('Authorization', `Bearer ${token}`);
                if (users[userType].role === 'admin') {
                    expect(response.status).toBe(204);
                } else {
                    expect(response.status).not.toBe(204);
                }
            });
        });
    });
});