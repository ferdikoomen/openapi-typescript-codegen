'use strict';

const path = require('path');
const ts = require('typescript');
const OpenAPI = require('../dist');

function compile(dir) {
    const config = {
        compilerOptions: {
            target: 'esnext',
            module: 'commonjs',
            moduleResolution: 'node',
        },
        include: ['./index.ts'],
    };
    const configFile = ts.parseConfigFileTextToJson('tsconfig.json', JSON.stringify(config));
    const configFileResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.resolve(process.cwd(), dir), undefined, 'tsconfig.json');
    const compilerHost = ts.createCompilerHost(configFileResult.options);
    const compiler = ts.createProgram(configFileResult.fileNames, configFileResult.options, compilerHost);
    compiler.emit();
}

async function run() {
    console.time('generate');

    await OpenAPI.generate({
        input: './test/mock/v2/spec.json',
        output: './test/result/v2/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
    });

    await OpenAPI.generate({
        input: './test/mock/v3/spec.json',
        output: './test/result/v3/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
    });

    console.timeEnd('generate');

    compile('./test/result/v2/');
    compile('./test/result/v3/');
}

run();
