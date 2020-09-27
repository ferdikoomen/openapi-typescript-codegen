'use strict';

module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: true,
            },
        }],
        ['@babel/preset-typescript', {
            onlyRemoveTypeImports: true,
        }],
    ],
};
