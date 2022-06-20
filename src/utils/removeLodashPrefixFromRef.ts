import { removeLodashPrefix } from './removeLodashPrefix';

export const removeLodashPrefixFromRef = (swaggerRef: string) => {
    return (
        swaggerRef
            .split('/')
            .slice(0, -1)
            .reduce((acc: string, it: string) => `${acc}${it}/`, '') +
        removeLodashPrefix(swaggerRef.split('/').slice(-1)[0])
    );
};
