export const isString = (val: unknown): val is string => {
    return typeof val === 'string';
};
