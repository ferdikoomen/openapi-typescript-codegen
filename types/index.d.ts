export declare enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
    NODE = 'node',
    AXIOS = 'axios',
    ANGULAR = 'angular',
}

export declare enum Indent {
    SPACE_4 = '4',
    SPACE_2 = '2',
    TAB = 'tab',
}

export type Options = {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular';
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    indent?: Indent | '4' | '2' | 'tab';
    postfixServices?: string;
    postfixModels?: string;
    request?: string;
    write?: boolean;
    coreLocation?: string;
};

export interface OpenApi {}
export interface Service {
    name: string;
    operations: Operation[];
    imports: string[];
}
export interface Operation {
    service: string;
    name: string;
    summary: string | null;
    description: string | null;
    deprecated: boolean;
    method: string;
    path: string;
    responseHeader: string | null;
}

export declare function generate(options: Options): Promise<void>;
export declare function getServices(openApi: OpenApi): Service[];

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
};

export default OpenAPI;
