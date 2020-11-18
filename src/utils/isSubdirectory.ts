import * as path from 'path';

export function isSubDirectory(parent: string, child: string) {
    return path.relative(child, parent).startsWith('..');
}
