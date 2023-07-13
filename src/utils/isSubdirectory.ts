import { relative } from 'path';

export const isSubDirectory = (parent: string, child: string): boolean => {
    return relative(child, parent).startsWith('..');
};
