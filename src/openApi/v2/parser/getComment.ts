export function getComment(comment: string | undefined): string | undefined {
    if (comment) {
        return comment.replace(/(\r\n|\n|\r)+/g, '$1     * ');
    }
    return undefined;
}
