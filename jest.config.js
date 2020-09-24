module.exports = {
    testRegex: '.*\\.spec\\.(js|js)$',
    testPathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/samples/',
    ],
    testEnvironment: 'node',
    moduleNameMapper: {
        '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.js',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!**/node_modules/**',
    ],
};
