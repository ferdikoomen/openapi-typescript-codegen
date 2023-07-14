const crossSpawn = require('cross-spawn');

describe('bin', () => {
    it('it should support minimal params', async () => {
        const result = crossSpawn.sync('node', [
            './bin/index.mjs',
            '--input', './test/spec/v3.json',
            '--output', './test/generated/bin',
            '--factories', './test/generated/bin',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('it should support all params', async () => {
        const result = crossSpawn.sync('node', [
            './bin/index.mjs',
            '--input', './test/spec/v3.json',
            '--output', './test/generated/bin',
            '--factories', './factories',
            '--client', 'fetch',
            '--useUnionTypes',
            '--exportCore', 'true',
            '--exportServices', 'true',
            '--exportSchemas', 'true',
            '--indent', '4',
            '--postfixServices', 'Service',
            '--postfixModels', 'Dto',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('it should throw error without params', async () => {
        const result = crossSpawn.sync('node', ['./bin/index.mjs']);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain(`error: required option '-i, --input <value>' not specified`);
    });

    it('it should throw error with wrong params', async () => {
        const result = crossSpawn.sync('node', [
            './bin/index.mjs',
            '--input', './test/spec/v3.json',
            '--output', './test/generated/bin',
            '--factories', './factories',
            '--unknown',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain(`error: unknown option '--unknown'`);
    });

    it('it should display help', async () => {
        const result = crossSpawn.sync('node', ['./bin/index.mjs', '--help']);
        expect(result.stdout.toString()).toContain(`Usage: openapi [options]`);
        expect(result.stdout.toString()).toContain(`-i, --input <value>`);
        expect(result.stdout.toString()).toContain(`-o, --output <value>`);
        expect(result.stdout.toString()).toContain(`-f, --factories <value>`);
        expect(result.stderr.toString()).toBe('');
    });
});
