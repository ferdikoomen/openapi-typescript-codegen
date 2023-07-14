import fsExtra from 'fs-extra';

const {
    copyFile: __copyFile,
    mkdirp: __mkdirp,
    pathExists: __pathExists,
    readFile: __readFile,
    remove: __remove,
    writeFile: __writeFile,
} = fsExtra;

// Export calls (needed for mocking)
export const readFile = __readFile;
export const writeFile = __writeFile;
export const copyFile = __copyFile;
export const exists = __pathExists;
export const mkdir = __mkdirp;
export const rmdir = __remove;
