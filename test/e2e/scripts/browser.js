'use strict';

const puppeteer = require('puppeteer');

let browser;
let page

async function start() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(`http://localhost:3000/`, {
        waitUntil: 'networkidle0',
    });
}

async function stop() {
    await page.close();
    await browser.close();
}

async function evaluate(fn) {
    return await page.evaluate(fn);
}

module.exports = {
    start,
    stop,
    evaluate,
};
