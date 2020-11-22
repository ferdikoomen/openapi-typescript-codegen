export interface ParserMeta {
    /**
     * The base URI where the OpenAPI specification
     * is stored. Used to resolve relative $ref
     * to external files
     */
    baseUri: string;
    projectPath: string;
}
