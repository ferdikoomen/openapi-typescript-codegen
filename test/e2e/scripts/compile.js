'use strict';

const ts = require('typescript');
const path = require('path');
const os = require('os');

function compile(version, client) {
    const baseDir = `./test/e2e/generated/src/${version}/${client}`;
    const tsconfig = {
        compilerOptions: {
            target: 'es6',
            module: 'commonjs',
            moduleResolution: 'node',
        },
        include: ['./index.ts'],
    };
    const configFile = ts.parseConfigFileTextToJson('tsconfig.json', JSON.stringify(tsconfig));
    const configFileResult = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.resolve(process.cwd(), baseDir), undefined, 'tsconfig.json');
    const compilerHost = ts.createCompilerHost(configFileResult.options);
    const compiler = ts.createProgram(configFileResult.fileNames, configFileResult.options, compilerHost);
    const result = compiler.emit();
    const diagnostics = ts.getPreEmitDiagnostics(compiler).concat(result.diagnostics);
    if (diagnostics.length) {
        console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
            getCanonicalFileName: f => f,
            getNewLine: () => os.EOL
        }));
    }
}

module.exports = compile;
