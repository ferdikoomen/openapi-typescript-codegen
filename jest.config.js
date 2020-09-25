module.exports = {
    projects: [
        {
            displayName: 'UNIT',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/src/**/*.spec.ts',
                '<rootDir>/test/**/*.spec.js',
            ],
            moduleNameMapper: {
                '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.js',
            },
            collectCoverageFrom: [
                'src/**/*.ts',
                '!src/**/*.d.ts',
            ],
        },
        {
            displayName: 'E2E',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/e2e/index.js',
            ],
            globals: {
                URL: 'http://localhost:3000',
            },
        },
    ],
};
