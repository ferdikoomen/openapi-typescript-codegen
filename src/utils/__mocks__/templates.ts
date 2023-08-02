import type { Templates } from '../registerHandlebarTemplates';

export const templates: Templates = {
    index: () => 'index',
    client: () => 'client',
    exports: {
        pathnames: {
            pathname: () => 'pathname',
            index: () => 'pathnameIndex',
        },
        factories: {
            types: () => 'factoriesTypes',
            serverResolver: () => 'serverResolver',
            clientResolver: () => 'clientResolver',
            hook: () => 'hook',
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
        hook: {
            resolver: () => 'hookResolver',
            index: () => 'hookIndex',
        },
        model: () => 'model',
        schema: () => 'schema',
        service: () => 'service',
    },
    util: {
        createRequestParams: () => 'createRequestParams content',
    },
};
