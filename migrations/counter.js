'use strict';

exports.up = function up(knex) {
  return knex.schema.createTable('counter', table => {
    table.bigInteger('count').default(0).unsigned().notNullable();
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTable('counter');
};
