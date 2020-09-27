'use strict';

const glob = require('glob');
const fs = require('fs');
const babel = require('@babel/core');

function transpile(dir) {
    glob.sync(`./test/e2e/generated/${dir}/**/*.ts`).forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8').toString();
            const result = babel.transformSync(content, {filename: file});
            const filename = file.replace(/\.ts$/, '.js');
            fs.writeFileSync(filename, result.code);
        } catch (error) {
            console.error(error);
        }
    });
}

module.exports = transpile;
