'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function copy(version, client) {
    const input = path.resolve('./test/e2e/test/');
    const output = path.resolve(`./test/e2e/generated/${version}/${client}/js`);
    const files = glob.sync('*.js', { cwd: input });
    for (let file of files) {
        fs.copyFileSync(
            path.resolve(input, file),
            path.resolve(output, file)
        );
    }
}

module.exports = copy;
