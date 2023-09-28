import type { Templates } from '../registerHandlebarTemplates';

export const templates: Templates = {
    index: () => 'index',
    exports: {
        pathnames: {
            pathname: () => 'pathname',
            index: () => 'pathnameIndex',
        },
        factories: {
            types: () => 'factoriesTypes',
            index: () => 'factoriesIndex',
        },
        server: {
            resolver: () => 'sererResolver',
            index: () => 'serverIndex',
        },
        client: {
            resolver: () => 'clientResolver',
            index: () => 'clientIndex',
        },
        hooks: {
            resolver: () => 'hookResolver',
            index: () => 'hookIndex',
        },
        model: () => 'model',
        schema: () => 'schema',
    },
};
