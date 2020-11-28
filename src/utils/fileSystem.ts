import { copyFile as __copyFile, exists as __exists, readFile as __readFile, writeFile as __writeFile } from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { promisify } from 'util';

// Wrapped file system calls
export const readFile = promisify(__readFile);
export const writeFile = promisify(__writeFile);
export const copyFile = promisify(__copyFile);
export const exists = promisify(__exists);

// Re-export from mkdirp to make mocking easier
export const mkdir = mkdirp;

// Promisified version of rimraf
export const rmdir = (path: string): Promise<void> =>
    new Promise((resolve, reject) => {
        rimraf(path, (error: Error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
