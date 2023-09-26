import type { Config } from 'jest';

import * as path from 'path';

const config: Config = {
    projects: [
        {
            displayName: 'UNIT',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/test/index.spec.ts', '<rootDir>/bin/index.spec.js'],
            moduleNameMapper: {
                '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.ts',
                '(.*)\\.js$': '$1',
            },
            transform: {
                '^.+\\.(t|m?j)s$': 'babel-jest',
            },
            transformIgnorePatterns: [`${path.join(__dirname, '../..')}node_modules/.pnpm/(?!(query-string))`],
            moduleFileExtensions: ['js', 'ts', 'd.ts', 'mjs'],
        },
    ],
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.d.ts', '!<rootDir>/bin', '!<rootDir>/dist'],
};

export default config;
