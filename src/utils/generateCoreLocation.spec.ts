import { generateCoreLocationUpLevelFromOutput } from './generateCoreLocation';

describe('generateCoreLocation', () => {
    it('Happy path', () => {
        const loc = generateCoreLocationUpLevelFromOutput('coreDir1/coreDir2/core', 'output/dir1/dir2');

        expect(loc).toEqual('../../../../coreDir1/coreDir2/core');
    });

    it('output starts with ./', () => {
        const loc = generateCoreLocationUpLevelFromOutput('coreDir1/coreDir2/core', './output/dir1/dir2');

        expect(loc).toEqual('../../../../coreDir1/coreDir2/core');
    });

    it('output ends with /', () => {
        const loc = generateCoreLocationUpLevelFromOutput('coreDir1/coreDir2/core', './output/dir1/dir2/');

        expect(loc).toEqual('../../../../coreDir1/coreDir2/core');
    });

    it('coreLoc starts with ./', () => {
        const loc = generateCoreLocationUpLevelFromOutput('./coreDir1/coreDir2/core', './output/dir1/dir2/');

        expect(loc).toEqual('../../../../coreDir1/coreDir2/core');
    });

    it('coreLoc ends with /', () => {
        const loc = generateCoreLocationUpLevelFromOutput('./coreDir1/coreDir2/core/', './output/dir1/dir2/');

        expect(loc).toEqual('../../../../coreDir1/coreDir2/core');
    });
});
