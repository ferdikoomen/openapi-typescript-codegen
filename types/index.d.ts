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
    input: string | Record<string, unknown>;
    output: string;
    factories: string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular';
    clientName?: string;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportSchemas?: boolean;
    indent?: Indent | '4' | '2' | 'tab';
    postfixServices?: string;
    postfixModels?: string;
    write?: boolean;
};

export declare function generate(options: Options): Promise<void>;

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
};

export default OpenAPI;
