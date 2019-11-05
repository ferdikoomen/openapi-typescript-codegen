module.exports = {
    testRegex: '\\.spec\\.tsx?$',
    testEnvironment: 'node',
    transform: {
        '\\.tsx?$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            compiler: 'typescript',
            tsConfig: {
                declaration: false,
                declarationMap: false,
                sourceMap: false
            }
        }
    }
};
