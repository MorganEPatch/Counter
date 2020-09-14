'use strict';

const axios = require('axios');
const expect = require('chai').expect;

const knexfile = require('../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV]);

const { app, server } = require('../src/app');
let trx = null;

const port = app.get('port');
const baseUrl = `http://localhost:${port}`;

const request = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization:  'bearer {"active": true, "sub": "user"}',
    'Content-Type': 'application/json',
  },
  responseType:     'json',
  responseEncoding: 'utf8',
});

describe('Sanity', () => {
  it("returns 400 if a request body can't be parsed", async () => {
    try {
      await request.post('/', "{'key': 'val");
      expect.fail('Request should have failed');
    }
    catch (err) {
      expect(err.response.status).to.equal(400);
    }
  });
});

describe('API', () => {
  before(async () => {
    await knex.migrate.latest();
  });

  beforeEach(async () => {
    try {
      trx = await knex.transaction();
      app.set('knex', trx);
      await trx('counter').insert({ count: 0 });
    }
    catch (error) {
      if (error !== 'test rollback') {
        throw error;
      }
    }
  });
  afterEach(async () => {
    await trx.rollback('test rollback');
  });

  after(async () => {
    await knex.migrate.down();
    server.close();
  });

  it('returns a value of 0 initially', async () => {
    const response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.equal({ count: 0, README: 'https://github.com/MorganEPatch/Counter' });
  });

  it('adds one to the value when POSTed', async () => {
    let response = await request.post('/');
    expect(response.status).to.equal(204);
    expect(response.data).to.equal('');

    response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.equal({ count: 1, README: 'https://github.com/MorganEPatch/Counter' });
  });

  it('resets the value on a DELETE call', async () => {
    let response = await request.post('/');
    expect(response.status).to.equal(204);
    expect(response.data).to.equal('');

    response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.equal({ count: 1, README: 'https://github.com/MorganEPatch/Counter' });

    response = await request.delete('/');
    expect(response.status).to.equal(204);
    expect(response.data).to.equal('');

    response = await request.get('/');
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.equal({ count: 0, README: 'https://github.com/MorganEPatch/Counter' });
  });

  it('requires a bearer token for DELETE', async () => {
    try {
      const response = await axios.delete(baseUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType:     'json',
        responseEncoding: 'utf8',
      });
      expect.fail(`Request should fail with no bearer token. Response code: ${response.status}`);
    }
    catch (error) {
      expect(error.response.status).to.equal(401);
      expect(error.response.data).to.deep.equal({ error: 'Missing bearer token' });
    }

    try {
      const response = await axios.delete(baseUrl, {
        headers: {
          Authorization:  'bearer {"active": false, "sub": "user"}',
          'Content-Type': 'application/json',
        },
        responseType:     'json',
        responseEncoding: 'utf8',
      });
      expect.fail(`Request should fail with inactive access token. Response code: ${response.status}`);
    }
    catch (error) {
      expect(error.response.status).to.equal(401);
      expect(error.response.data).to.deep.equal({ error: 'Invalid bearer token' });
    }

    try {
      const response = await axios.delete(baseUrl, {
        headers: {
          Authorization:  'bearer {"active": true}',
          'Content-Type': 'application/json',
        },
        responseType:     'json',
        responseEncoding: 'utf8',
      });
      expect.fail(`Request should fail with a userless bearer token. Response code: ${response.status}`);
    }
    catch (error) {
      expect(error.response.status).to.equal(401);
      expect(error.response.data).to.deep.equal({ error: 'Invalid bearer token' });
    }

    const response = await axios.delete(baseUrl, {
      headers: {
        Authorization:  'bearer {"active": true, "sub": "user"}',
        'Content-Type': 'application/json',
      },
      responseType:     'json',
      responseEncoding: 'utf8',
    });
    expect(response.status).to.equal(204);
    expect(response.data).to.equal('');
  });
});
