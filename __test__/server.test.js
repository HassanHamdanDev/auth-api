'use strict';


const supertest = require('supertest');
const { server } = require('../src/server');
const mockRequest = supertest(server);

describe('Server Test', () => {
    it('working server', async () => {
        const response = await mockRequest.get('/');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual(' !!! working Fine');
    });
    it('bad method', async () => {
        const response = await mockRequest.get('/*');
        expect(response.status).toEqual(404);
    });
});