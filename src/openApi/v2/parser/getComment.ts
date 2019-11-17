import { EOL } from 'os';

export function getComment(comment?: string): string | undefined {
    if (comment) {
        return comment
            .split(/(\r\n|\n|\r)+/g)
            .filter(line => line)
            .map(line => line.trim())
            .join(EOL)
            .replace(/(\r\n|\n|\r)+/g, '$1     * ');
    }
    return undefined;
}
