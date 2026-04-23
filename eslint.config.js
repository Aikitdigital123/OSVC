import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const browserGlobals = {
    ...globals.browser,
    ResizeObserver: 'readonly',
};

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'public/**'],
    },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: browserGlobals,
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...browserGlobals,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
    {
        files: ['*.js', 'tools/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
    eslintConfigPrettier,
];
