# Counter


[![build status](https://travis-ci.org/MorganEPatch/Counter.svg?branch=master)](https://travis-ci.org/github/MorganEPatch/Counter)

A simple, complete ExpressJS app which counts upwards. This can be used as a
base for designing new apps with dependencies, database connections, testing,
and linting already configured.

## Requirements

* NodeJS
* NPM
* SQLite 3 installed, or a PostgreSQL database

## Installation

Install the project's dependencies:
```shell script
$ npm install
```

Configure the PostgreSQL database:
```shell script
$ psql -c 'create database counter;' -U <pg_user> -h <pg_host> -p <pg_port>
$ export PG_CONNECTION_STRING=postgres://<pg_user>@<pg_host>:<pg_port>/counter
$ export NODE_ENV=production
$ export PORT=<counter_port>
$ npm run migrations
```

Finally, run the application:
```shell script
$ npm start
```

## API

The API consists of 3 simple endpoints, all on the base path:

### GET

```shell script
$ curl -X GET http://<host>:<port>/
```

This will return a JSON object with two fields: `count` will contain the current
state of the counter, and `README` contains a link back to this repository.

### POST

```shell script
$ curl -X POST http://<host>:<port>/
```

Although this is a POST response, no body is expected (although no error will be
thrown if one is provided). A 204 No Content response will be returned, and the
counter will be incremented for further GET requests.

### DELETE

```shell script
$ curl -X DELETE http://<host>:<port>/ -H 'Authorization: bearer {"active": true, "sub": "user"}'
```

Note that this endpoint requires a bearer token to be passed. If one is not
provided, a 401 Unauthorized will be returned. However, no authentication is
performed on the token; simply having a "sub", and an "active" value of true,
is sufficient.

A 204 No Content response will be returned, and the counter will be reset to 0
for further GET requests.

## Development

### Testing

To run the tests, use:
```shell script
$ npm test
```

However, to only run a subset of the tests, use:
```shell script
$ npm test -- -g <Test description to search for>
```

This performs a search similar to `grep` against the descriptions given in
`describe()` or `it()` calls.

This project also has linting, using both JSHint and ESLint.
```shell script
$ npm run linter
```

To run the linters followed by tests, use the LATTE (Lint and Thoroughly
Test Everything) command:
```shell script
$ npm run latte
```

### Running in Development

First, set the environment to development:
```shell script
$ export NODE_ENV=development
```

Then, run migrations. In development, this will automatically create a
SQLite database file.
```shell script
$ npm run migrations
```

Use "devel" instead of "start"; this is a convenience that will automatically
restart the server whenever the source files are changed.
```shell script
$ npm run devel
```

### Using PostgreSQL

If you wish to test the PostgreSQL integration during development, both the
live deployment and tests can be run against a PostgreSQL database.

To run the server against a PostgreSQL database:
```shell script
$ export NODE_ENV=development_pg
$ export PG_CONNECTION_STRING=postgres://<pg_user>@<pg_host>:<pg_port>/counter
$ npm run migrations
$ npm run devel
```

To run the tests against a PostgreSQL database:
```shell script
$ export TEST_PG_CONNECTION_STRING=postgres://<pg_user>@<pg_host>:<pg_port>/counter
$ npm run test_pg
```

## License

MIT © Morgan Patch 2020