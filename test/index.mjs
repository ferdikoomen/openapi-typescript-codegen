'use strict';

import OpenAPI from '../dist/index.js';

const generate = async (input, output) => {
    await OpenAPI.generate({
        input,
        output,
        factories: './factories.ts',
        useUnionTypes: false,
        exportSchemas: true,
        exportServices: true,
    });
};

const main = async () => {
    await generate('./test/spec/v2.json', './test/generated/v2/');
    await generate('./test/spec/v3.json', './test/generated/v3/');
};

main();
