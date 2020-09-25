'use strict';

const fs = require('fs');

async function copy(version, client) {
    return new Promise(resolve => {
        fs.copyFile('./test/e2e/test/index.ts', `./test/e2e/generated/${version}/${client}/index.ts`, resolve);
    });
}

module.exports = copy;
