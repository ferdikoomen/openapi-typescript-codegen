const MAPPINGS = new Map<string, string>([
    ['file', 'File'],
    ['binary', 'File'],
    ['array', 'any[]'],
    ['list', 'any[]'],
    ['object', 'any'],
    ['any', 'any'],
    ['boolean', 'boolean'],
    ['byte', 'number'],
    ['int', 'number'],
    ['int32', 'number'],
    ['int64', 'number'],
    ['integer', 'number'],
    ['float', 'number'],
    ['double', 'number'],
    ['short', 'number'],
    ['long', 'number'],
    ['number', 'number'],
    ['char', 'string'],
    ['date', 'string'],
    ['date-time', 'string'],
    ['password', 'string'],
    ['string', 'string'],
    ['void', 'void'],
    ['null', 'null'],
]);

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 * @param type
 */
export function getMappedType(type: string): string {
    const mapped: string | undefined = MAPPINGS.get(type.toLowerCase());
    if (mapped) {
        return mapped;
    }
    return type;
}

export function hasMappedType(type: string): boolean {
    return MAPPINGS.has(type.toLowerCase());
}
