'use strict';
/* eslint-disable no-console */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const knexfile = require('../knexfile');
const dbName = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexfile[dbName]);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// By default, all CORS requests are allowed
app.use(cors());

// Enable standard protections, such as xss filters, CSP headers, etc. We don't expect to have SSL, so disable HSTS.
app.use(helmet({
  hsts: false,
}));

const DEFAULT_PORT = 8000;
app.set('port', process.env.PORT || DEFAULT_PORT);

app.set('knex', knex);

const prefix = 'service';
app.set('prefix', prefix);

/*
 * Catch errors due to malformed or invalid JSON in request bodies and return a 400 error.
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).send({ error: 400 });
  }

  return next();
});

const server = app.listen(process.env.PORT || DEFAULT_PORT, () => {
  console.log('App now listening on %s', process.env.PORT || DEFAULT_PORT);
});

module.exports = { app, server };

app.get('/', async (req, res) => {
  const db = app.get('knex');

  try {
    let count = await db('counter')
      .select('count')
      .first();

    count = parseInt(count.count, 10);

    res.status(200).send({ count, README: 'https://github.com/MorganEPatch/Counter' });
  }
  catch (error) {
    res.status(500).send({ error });
  }
});

app.post('/', async (req, res) => {
  const db = app.get('knex');

  try {
    const rows = await db('counter')
      .increment('count', 1);

    if (rows) {
      res.status(204).send();
      return;
    }

    res.status(500).send({ error: true });
  }
  catch (error) {
    res.status(500).send({ error });
  }
});

app.delete('/', async (req, res) => {
  const auth = req.header('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer')) {
    res.status(401).send({ error: 'Missing bearer token' });
    return;
  }

  const token = JSON.parse(auth.substring('bearer '.length));
  if (!token || !token.active || !token.sub) {
    res.status(401).send({ error: 'Invalid bearer token' });
    return;
  }

  const db = app.get('knex');
  try {
    const rows = await db('counter')
      .update({ count: 0 });

    if (rows) {
      res.status(204).send();
      return;
    }

    res.status(500).send({ error: true });
  }
  catch (error) {
    res.status(500).send({ error });
  }
});
