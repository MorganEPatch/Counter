'use strict';
/* eslint-disable no-console */

const express = require('express');
const bodyParser = require('body-parser');

const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexfile[db]);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('knex', knex);

const prefix = 'service';
app.set('prefix', prefix);

/*
 * Catch errors due to malformed or invalid JSON in request bodies and
 * return a 400 error
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).send({error: 400});
  }
  next();
});

module.exports = app;

let count = 0;

app.listen(process.env.PORT || 8000, () => {
  console.log('App now listening on %s', process.env.PORT || 8000);
});

app.get('/', (req, res) => {
  return app.get('knex')('counter').select('count').first().then(c => {
    const cnt = Number.parseInt(c.count, 10);

    return res.send({count: cnt});
  }).error(() => {
    return res.status(500).send({error: true});
  });
});

app.post('/', (req, res) => {
  return app.get('knex')('counter').update({count: ++count}).then(rows => {
    if (rows) {
      return res.status(200).send();
    }

    return res.status(500).send({error: true});
  }).error(() => {
    return res.status(500).send({error: true});
  });
});

setTimeout(() => {
  app.get('knex')('counter').select('count').then(c => {
    if (!c || c.length === 0) {
      app.get('knex')('counter').insert({count: 0}).then(() => {}).error(() => {
        throw new Error('Database Error!');
      });
    } else {
      count = c[0].count;
    }
  });
}, 500);

app.get(`/${prefix}/$`, (req, res) => {
  res.status(404).send({error: 404});
});
