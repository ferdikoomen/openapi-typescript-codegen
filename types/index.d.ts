export declare enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
    NODE = 'node',
    AXIOS = 'axios',
    ANGULAR = 'angular',
    SADDLEBACK = 'saddleback',
}

export declare enum Indent {
    SPACE_4 = '4',
    SPACE_2 = '2',
    TAB = 'tab',
}

export type Options = {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular' | 'saddleback';
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    indent?: Indent | '4' | '2' | 'tab';
    postfix?: string;
    request?: string;
    write?: boolean;
};

export type CustomConfig = Options & {
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
};

export declare function generate(options: Options): Promise<void>;
export declare function generateSaddlebackSpec(config: CustomConfig): Promise<void>;

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
    generateCustomSpec: typeof generateSaddlebackSpec;
};

export default OpenAPI;
