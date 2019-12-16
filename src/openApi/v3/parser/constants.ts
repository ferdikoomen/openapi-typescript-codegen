export enum PrimaryType {
    FILE = 'File',
    OBJECT = 'any',
    ARRAY = 'any[]',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    STRING = 'string',
    VOID = 'void',
    NULL = 'null',
}

export const TYPE_MAPPINGS = new Map<string, PrimaryType>([
    ['file', PrimaryType.FILE],
    ['any', PrimaryType.OBJECT],
    ['object', PrimaryType.OBJECT],
    ['array', PrimaryType.ARRAY],
    ['boolean', PrimaryType.BOOLEAN],
    ['byte', PrimaryType.NUMBER],
    ['int', PrimaryType.NUMBER],
    ['int32', PrimaryType.NUMBER],
    ['int64', PrimaryType.NUMBER],
    ['integer', PrimaryType.NUMBER],
    ['float', PrimaryType.NUMBER],
    ['double', PrimaryType.NUMBER],
    ['short', PrimaryType.NUMBER],
    ['long', PrimaryType.NUMBER],
    ['number', PrimaryType.NUMBER],
    ['char', PrimaryType.STRING],
    ['date', PrimaryType.STRING],
    ['date-time', PrimaryType.STRING],
    ['password', PrimaryType.STRING],
    ['string', PrimaryType.STRING],
    ['void', PrimaryType.VOID],
    ['null', PrimaryType.NULL],
]);

export enum Method {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    DELETE = 'delete',
    OPTIONS = 'options',
    HEAD = 'head',
    PATCH = 'patch',
}

export enum ContentType {
    APPLICATION_JSON_PATCH = 'application/json-patch+json',
    APPLICATION_JSON = 'application/json',
    TEXT_JSON = 'text/json',
    TEXT_PAIN = 'text/plain',
    MULTIPART_MIXED = 'multipart/mixed',
    MULTIPART_RELATED = 'multipart/related',
    MULTIPART_BATCH = 'multipart/batch',
}
