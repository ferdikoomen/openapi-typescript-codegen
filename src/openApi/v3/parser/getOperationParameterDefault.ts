export function getOperationParameterDefault(value: any): string | null {
    if (value === null) {
        return 'null';
    }

    switch (typeof value) {
        case 'number':
        case 'boolean':
            return JSON.stringify(value);
        case 'string':
            return `'${value}'`;
    }

    return null;
}
