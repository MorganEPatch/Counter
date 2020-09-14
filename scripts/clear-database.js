'use strict';

const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexfile[db]);

const deletePromises = [knex('counter').del()];

Promise.all(deletePromises)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to clear database! Error:');
    console.error(error);
    throw error;
  });
