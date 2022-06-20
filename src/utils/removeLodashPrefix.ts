export const removeLodashPrefix = (s: string): string => {
    return s.split('_').slice(-1)[0];
};
