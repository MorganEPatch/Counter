'use strict';

const request = require('request');
const expect = require('chai').expect;

const knexfile = require('../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV]);

const app = require('../src/app');
let trx;

const port = process.env.PORT || 8000;
const baseUrl = `http://localhost:${port}/`;

const transact = function transact(done) {
  knex.transaction(function(newTrx) {
    trx = newTrx;
    app.set('knex', trx);
    trx('counter').insert({count: 0}).then(function() {
      done();
    });
  }).catch(function(e) {
    // only swallow the test rollback error
    if (e !== 'test rollback') {
      throw e;
    }
  });
};

const endTransact = function endTransact(done) {
  trx.rollback('test rollback').then(function() {
    done();
  });
};

describe('API', function() {
  before(function(done) {
    knex.migrate.latest().then(function() {
      done();
    });
  });

  beforeEach(transact);
  afterEach(endTransact);

  it('returns a value of 0 initially', function(done) {
    setTimeout(function() {
      request.get(baseUrl, function(req, res, body) {
        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(body)).to.deep.equal({count: 0});
        done();
      });
    }, 1000);
  });

  it('adds one to the value when posted', function(done) {
    setTimeout(function() {
      request.post(baseUrl, function(req, res, body) {
        expect(res.statusCode).to.equal(200);
        expect(body).to.equal('');

        request.get(baseUrl, function(getReq, getRes, getBody) {
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.equal({count: 1});

          done();
        });
      }, 1000);
    });
  });
});
