module.exports = {
    testRegex: '\\.spec\\.(ts|js)$',
    testEnvironment: 'node',
    moduleNameMapper: {
        '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.js',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/templates/**',
        '!**/node_modules/**',
    ],
};
