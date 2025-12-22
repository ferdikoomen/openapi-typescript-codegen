import javascript from '@eslint/js';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import typescript from 'typescript-eslint';

export default [
    {
        ignores: ['dist', 'samples', 'test/generated', 'test/e2e/generated', 'node_modules'],
    },
    javascript.configs.recommended,
    ...typescript.configs.recommended,
    prettierConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest,
                ...globals.es2019,
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-inferrable-types': 0,
            '@typescript-eslint/no-non-null-assertion': 0,
            '@typescript-eslint/no-var-requires': 0,
            '@typescript-eslint/no-require-imports': 0,
            '@typescript-eslint/ban-ts-ignore': 0,
            '@typescript-eslint/ban-ts-comment': 0,
            '@typescript-eslint/explicit-function-return-type': 0,
            '@typescript-eslint/explicit-module-boundary-types': 0,
            'sort-imports': 'off',
            'import/order': 'off',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'prettier/prettier': ['error'],
        },
    },
];
