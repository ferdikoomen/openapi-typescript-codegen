'use strict';

const fs = require('fs');

async function copy(version, client) {
    fs.copyFileSync(
        './test/e2e/assets/script.js',
        `./test/e2e/generated/${version}/${client}/script.js`,
    );
}

module.exports = copy;
