import { EOL } from 'os';

export function getComment(comment?: string): string | null {
    if (comment) {
        return comment.replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
    }
    return null;
}
