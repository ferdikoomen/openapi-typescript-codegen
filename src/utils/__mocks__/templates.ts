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
    core: {
        settings: () => 'settings',
        apiError: () => 'apiError',
        apiRequestOptions: () => 'apiRequestOptions',
        apiResult: () => 'apiResult',
        cancelablePromise: () => 'cancelablePromise',
        baseHttpRequest: () => 'baseHttpRequest',
        httpRequest: () => 'httpRequest',
    },
};
