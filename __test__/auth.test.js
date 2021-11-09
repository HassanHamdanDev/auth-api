'use strict';

process.env.SECRET = `guava${Math.random() * 10000}`;

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


Object.keys(users).forEach(userType => {
    describe(`${userType} users`, () => {
        it('create user', async () => {
            const response = await mockRequest.post('/signup').send(users[userType]);
            const userObject = response.body;
            expect(response.status).toBe(201);
            expect(userObject.token).toBeDefined();
            expect(userObject.user.id).toBeDefined();
            expect(userObject.user.username).toEqual(users[userType].username);
            expect(userObject.user.role).toEqual(users[userType].role);
        });

        it('signin basic auth', async () => {
            const response = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
            const userObject = response.body;
            expect(response.status).toBe(200);
            expect(userObject.token).toBeDefined();
            expect(userObject.user.id).toBeDefined();
            expect(userObject.user.username).toEqual(users[userType].username);
            expect(userObject.user.role).toEqual(users[userType].role);
        });

        it('signin bearer auth', async () => {
            const response = await mockRequest.post('/signin').auth(users[userType].username, users[userType].password);
            const token = response.body.token;
            const bearerResponse = await mockRequest.get('/secret').set('Authorization', `Bearer ${token}`)
            expect(bearerResponse.status).toBe(200);
        });
    });
});

describe('login errors', () => {
    it('signin in incorrect password', async () => {
        const response = await mockRequest.post('/signin').auth('admin', 'xyz')
        const userObject = response.body;
        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined();
    });

    it('signin in with invalid user', async () => {
        const response = await mockRequest.post('/signin').auth('nobody', 'xyz')
        const userObject = response.body;
        expect(response.status).toBe(403);
        expect(userObject.user).not.toBeDefined();
        expect(userObject.token).not.toBeDefined();
    });

    it('bearer invalid token', async () => {
        const bearerResponse = await mockRequest.get('/secret').set('Authorization', 'Bearer foobar');
        expect(bearerResponse.status).not.toBe(200);
    });
});
