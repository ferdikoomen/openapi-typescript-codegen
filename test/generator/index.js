'use strict';

const path = require('path');
const ts = require('typescript');
const OpenAPI = require('../../dist');

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

async function generateV2() {
    console.time('generate v2');
    await OpenAPI.generate({
        input: './test/spec/v2.json',
        output: './test/generator/dist/v2/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
    });
    console.timeEnd('generate v2');
    compile('test/generator/dist/v2/');
}

async function generateV3() {
    console.time('generate v3');
    await OpenAPI.generate({
        input: './test/spec/v3.json',
        output: './test/generator/dist/v3/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
    });
    console.timeEnd('generate v3');
    compile('test/generator/dist/v3/');
}

async function generate() {
    await generateV2();
    await generateV3();
}

generate();
