import copy from 'recursive-copy';

await copy('src/templates', 'dist/templates', { overwrite: true });
