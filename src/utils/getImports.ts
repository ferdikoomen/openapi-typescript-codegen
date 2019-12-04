import * as glob from 'glob';
import * as path from 'path';

export function getImports(folder: string): string[] {
    const files = glob.sync('**/*.{ts,js}', { cwd: folder });
    return files
        .map(file => path.basename(file))
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
