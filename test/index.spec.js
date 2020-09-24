'use strict';

const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

describe('e2e', () => {

    let app;
    let browser;
    let page;
    let server;

    beforeAll(async () => {
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
        server = app.listen(3000);
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        await page.close();
        await browser.close();
        await server.close();
    });

    it('runs in chrome', async () => {
        await page.goto('http://localhost:3000/api/test', {
            waitUntil: 'networkidle0',
        });
        const content = await page.content();
        expect(content).toBeDefined();
    });

    it('runs in node', async () => {
        return new Promise((resolve) => {
            http.get('http://localhost:3000/api/test', (res) => {
                const chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    const content = Buffer.concat(chunks).toString();
                    console.log(content);
                    expect(content).toBeDefined();
                    resolve();
                });
            })
        });
    });

})
