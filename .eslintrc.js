'use strict';

module.exports = {
    extends: [
        './eslint-rules/best-practice.js',
        './eslint-rules/errors.js',
        './eslint-rules/es6.js',
        './eslint-rules/style.js',
        './eslint-rules/variables.js',
    ],
    parserOptions: {
        ecmaVersion: 6,
    },
    env: {
        node: true,
        es6: true,
    },
    rules: {
        strict: ['error', 'global'],

        // Always require return statements after callbacks
        'callback-return': 'error',

        // Require require() to be at top-level of scope
        'global-require': 'error',

        // Don't require callbacks to handle errors
        'handle-callback-err': 'off',

        // Disallow mixing require() with other variable declarations
        'no-mixed-requires': 'error',

        // Disallow use of `new require()` (use parens if you need to)
        'no-new-require': 'error',

        // Require path.join instead of concat with __filename and __dirname
        'no-path-concat': 'error',

        // Allow process.env to be used (we use it for configuration)
        'no-process-env': 'off',

        // Disallow process.exit(), because we don't want to use it anywhere
        // Change this in a .eslintrc for command-line executables
        'no-process-exit': 'error',

        // Allow all modules to be used
        'no-restricted-modules': 'off',

        // Disallow synchronous methods (maybe change for command-line executables)
        'no-sync': 'error',
    }
};