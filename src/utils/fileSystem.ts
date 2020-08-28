import * as fs from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import * as util from 'util';

// Wrapped file system calls
export const readFile = util.promisify(fs.readFile);
export const writeFile = util.promisify(fs.writeFile);
export const copyFile = util.promisify(fs.copyFile);
export const exists = util.promisify(fs.exists);

// Re-export from mkdirp to make mocking easier
export const mkdir = mkdirp;

// Promisified version of rimraf
export const rmdir = (path: string) =>
    new Promise((resolve, reject) => {
        rimraf(path, (error: Error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
