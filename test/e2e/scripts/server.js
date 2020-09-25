'use strict';

const express = require('express');

let app;
let server

async function start() {
    return new Promise(resolve => {
        app = express();
        app.all('/api/*', (req, res) => {
            res.send({
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
