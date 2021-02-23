'use strict';

const express = require('express');

let app;
let server

async function start(dir) {
    return new Promise(resolve => {
        app = express();

        // Serve the JavaScript files from the specific folder, since we are using browser
        // based ES6 modules, this also means that we can just request the js/index.js file
        // and all other relative paths are resolved from that file.
        app.use('/js', express.static(`./test/e2e/generated/${dir}/`, {
            extensions: ['', 'js'],
            index: 'index.js',
        }));

        // When we request the index then we can just return the script loader.
        // This file is copied from test/e2e/assets/script.js to the output directory
        // of the specific version and client.
        app.get('/', (req, res) => {
            res.send('<script src="js/script.js"></script>');
        });

        // Register an 'echo' server that just returns all data from the API calls.
        // Although this might not be a 'correct' response, we can use this to test
        // the majority of API calls.
        app.all('/base/api/*', async (req, res) => {
            if (req.headers['x-delay']) {
                const time = Number.parseInt(req.headers['x-delay'], 10);
                await new Promise(resolve => setTimeout(resolve, time));
            }
            res.json({
                method: req.method,
                protocol: req.protocol,
                hostname: req.hostname,
                path: req.path,
                url: req.url,
                query: req.query,
                body: req.body,
                headers: req.headers,
            });
        });


        server = app.listen(3000, resolve);
    });
}

async function stop() {
    return new Promise(resolve => {
        server.close(resolve);
    });
}

module.exports = {
    start,
    stop,
};
