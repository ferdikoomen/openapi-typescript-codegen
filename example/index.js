const OpenAPI = require('../dist');

OpenAPI.generate({
    input: './example/api-documentation.yml',
    output: './example/dist',
    useUnionTypesForEnums: true,
    exportCore: false,
    exportServices: false,
});
