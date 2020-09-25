'use strict';

const puppeteer = require('puppeteer');

let browser;
let page

async function start() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
}

async function stop() {
    await page.close();
    await browser.close();
}

module.exports = {
    start,
    stop,
};
