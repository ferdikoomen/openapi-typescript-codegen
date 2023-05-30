const _capitalize = (string: string): string => {
    return string.slice(0, 1).toUpperCase() + string.slice(1, string.length);
};

export const toPascalCase = (str: string): string => {
    return str
        .split('_')
        .map(str => _capitalize(str.split('/').map(_capitalize).join('/')))
        .join('')
        .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
        .replace(/\s+/g, '');
};
